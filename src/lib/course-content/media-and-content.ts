import type { CourseContent } from './types';

/**
 * Level 2 — Responsible Media and Content. Pass mark 70.
 *
 * Built around the four outcomes that matter most for a volunteer who picks
 * up a phone at a field activity: consent before the camera, a caption that
 * honours the person rather than the cause, verification before publishing,
 * and the difference between what belongs on a personal account and what
 * belongs on an official one.
 *
 * The recurring tension across every module is that the impulse which causes
 * harm here is usually a good one — wanting to share, wanting to prove impact,
 * wanting to defend the organisation, wanting to show the scale of a problem.
 * The course does not argue against those impulses. It argues that they have
 * better and worse ways of expressing themselves, and that the worse ways cost
 * the people in the frame more than they cost the person holding the phone.
 */

export const mediaAndContent: CourseContent = {
  slug: 'media-and-content',
  level: 2,
  minutes: 35,
  passMark: 70,
  title: {
    ar: 'الإعلام المسؤول وصناعة المحتوى',
    en: 'Responsible Media and Content',
  },
  lede: {
    ar: 'كيف تروي قصة عمل مجتمعي من دون استغلال معاناة أحد، ومن دون تضخيم رقم، ومن دون كشف وجه لا يجوز كشفه.',
    en: 'How to tell the story of community work without exploiting anyone\'s suffering, without inflating a number, and without showing a face that must not be shown.',
  },
  outcomes: {
    ar: [
      'تحصل على موافقة صحيحة قبل التصوير وتوثّقها',
      'تكتب تعليقاً صادقاً يحفظ كرامة من في الصورة',
      'تتحقّق من معلومة قبل نشرها وترفض تضخيم الأرقام',
      'تميّز بين الحساب الشخصي والحساب الرسمي في ما تنشر وكيف ترد',
    ],
    en: [
      'Obtain and record proper consent before photographing',
      'Write an honest caption that keeps the dignity of the person in the frame',
      'Verify a claim before publishing it, and refuse to inflate figures',
      'Distinguish a personal account from an official one in what you post and how you reply',
    ],
  },
  sources: [
    'ICRC — Professional Standards for Protection Work (third edition, 2018)',
    'IFRC Code of Conduct for the International Red Cross and Red Crescent Movement and NGOs in Disaster Relief',
    'Core Humanitarian Standard on Quality and Accountability (2024 edition)',
  ],

  modules: [
    // ---------------------------------------------------------------- 1
    {
      id: 'consent',
      tag: { ar: 'الوحدة الأولى', en: 'Module 1' },
      title: { ar: 'الموافقة قبل الكاميرا', en: 'Consent before the camera' },
      lede: {
        ar: 'صورة بلا موافقة ليست توثيقاً للعمل — بل انتزاعٌ لشيء لم يُعطَ.',
        en: 'A photograph taken without consent is not documentation of work — it is taking something that was not given.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'حين تدخل إلى نشاط وتسحب هاتفك لتصوّر، فأنت تطلب شيئاً من الناس الذين أمامك حتى لو لم تنطق بكلمة واحدة. الصورة تُنشر وتبقى وتُعاد مشاركتها. الشخص الذي في الصورة لن يكون قادراً على محوها بعد غدٍ، ولا يعرف أين ستصل ولا من سيراها. الموافقة المستنيرة لا تعني أن تمرّ بجانب أحد وتبتسم له ثم تصوّر، ولا تعني أن تصوّر من بعيد معتقداً أنك لم تزعجه. تعني أن تتوقّف قبل الكاميرا وتشرح له ما الصورة وأين ستُنشر ومن سيراها وأن له الحق في الرفض من دون أي ضغط ومن دون أن يؤثّر رفضه على مشاركته في النشاط أو على خدماته. الرفض لا يعني أنه لا يدعم عملك — يعني أنه يحفظ حقه في خصوصيته، وهو حق لا تملك أنت ولا منظمتك أن تقرّرا عنه.',
            en: 'When you walk into an activity and take out your phone to photograph, you are asking something of the people in front of you even if you say nothing. The photo gets published, persists, and is reshared. The person in it will not be able to erase it tomorrow, and does not know where it will end up or who will see it. Informed consent does not mean walking past someone, smiling, and photographing, nor does it mean shooting from a distance on the assumption you have not disturbed them. It means stopping before the camera and explaining what the photo is, where it will be published, who will see it, and that they have the right to refuse without any pressure and without their refusal affecting their participation or services. Refusal does not mean they do not support the work; it means they are protecting their right to privacy, which is a right neither you nor your organisation owns.',
          },
        },
        {
          type: 'ordered',
          items: {
            ar: [
              'تعرّف على نفسك وعلى المنظمة قبل أن تخرج الكاميرا أو الهاتف',
              'اشرح بجملتين ما الصورة ولماذا تريدها — «نريد نشرها على صفحتنا لنشرح ما نفعل في هذا البرنامج»',
              'وضّح أين ستُنشر بالتحديد: موقع إلكتروني؟ إنستغرام؟ تقرير سنوي؟ تقرير داخلي فقط؟',
              'أكّد أن الرفض لن يؤثّر على مشاركته في النشاط أو على أي خدمة يتلقّاها من المنظمة بأي شكل',
              'انتظر موافقة صريحة بالكلام أو إشارة واضحة — الصمت ليس موافقة، والابتسامة ليست موافقة',
              'وثّق الموافقة فور حصولك عليها: رسالة نصية أو بريد إلكتروني أو نموذج ورقي حسب نظام منظمتك',
            ],
            en: [
              'Introduce yourself and the organisation before the camera or phone comes out',
              'Explain in two sentences what the photo is and why you want it — "We want to post it on our page to explain what we do in this programme"',
              'Specify where it will appear: website? Instagram? An annual report? An internal report only?',
              'Confirm that refusing has no effect on their participation or on any service they receive from the organisation in any way',
              'Wait for explicit agreement in words or a clear gesture — silence is not consent, and a smile is not consent',
              'Record the consent as soon as you have it: a text message, an email, or a paper form depending on your organisation\'s system',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'stop',
          title: { ar: 'الأطفال: قاعدة مختلفة تماماً', en: 'Children: a completely different rule' },
          content: {
            ar: 'موافقة الطفل وحده لا تكفي قانوناً وأخلاقاً، حتى لو أجاب بنعم وبحماس كبير. الولي أو الوالد هو من يوافق، وموافقته تُوثَّق وتُحفظ. وحتى إن وافق الولي، يجوز للطفل أن يرفض في أي لحظة ويُحترم رفضه دون نقاش. الأطفال في مواقف الضعف — نازحون أو في برامج دعم نفسي أو في بيئات صعبة — قد لا يجرؤون على الرفض أمامك حتى لو أرادوا. الأمان الكامل هو ألّا تصوّر وجه أي طفل دون موافقة مكتوبة ومحفوظة من والده أو وليّه، مهما كانت الصورة جميلة ومهما كان الوقت ضيّقاً.',
            en: 'A child\'s consent alone is not enough, legally or ethically, even if they say yes enthusiastically. A parent or guardian consents, and their agreement is recorded and kept. Even if the guardian consents, the child may refuse at any moment and that refusal is respected without discussion. Children in vulnerable situations — displaced, in psychosocial support programmes, or in difficult environments — may not feel safe refusing in front of you even when they want to. The fully safe position is not to photograph any child\'s face without written, stored consent from a parent or guardian, however beautiful the image and however short the time.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'الموافقة تنتهي صلاحيّتها. الشخص الذي وافق على نشر صورته في سياق معيّن لم يوافق على نشرها في كل سياق مستقبلي. إن أردت استخدام صورة قديمة في سياق جديد — حملة تبرّع، تقرير عن موضوع مختلف، مشاركة مع شريك جديد — فالإجراء الصحيح هو العودة للشخص وطلب موافقة جديدة. قد يبدو هذا معقّداً، لكنه يحمي الشخص ويحمي منظمتك في الوقت نفسه. وإن تعذّر الوصول إليه، الخيار الآمن هو عدم استخدام الصورة.',
            en: 'Consent expires. A person who agreed to publish their image in one context did not agree to publish it in every future context. If you want to use an old photograph in a new context — a fundraising campaign, a report on a different subject, sharing with a new partner — the correct procedure is to return to the person and ask for new consent. This may seem complex, but it protects the person and the organisation at the same time. And if they cannot be reached, the safe choice is not to use the image.',
          },
        },
        {
          type: 'quiz',
          id: 'mc-q1',
          label: { ar: 'موقف عملي', en: 'Practical situation' },
          question: {
            ar: 'خلال نشاط توزيع مساعدات، اقترحت المنسّقة أن تصوّر بسرعة لأن الناس مشغولون ولا وقت للشرح. ماذا تفعل؟',
            en: 'During a distribution activity, the coordinator suggests you photograph quickly because people are busy and there is no time to explain. What do you do?',
          },
          options: [
            { ar: 'تصوّر من بعيد حتى لا تزعج أحداً وتنشر الصور لاحقاً', en: 'Photograph from a distance so as not to disturb anyone and post the photos later' },
            { ar: 'تؤجّل التصوير إلى لحظة تجد فيها دقيقة لتشرح وتأخذ موافقة', en: 'Postpone photographing to a moment when you have a minute to explain and obtain consent' },
            { ar: 'تصوّر ثم تعود لاحقاً لأخذ موافقة ممن تستطيع الوصول إليهم', en: 'Photograph and return later to get consent from whoever you can reach' },
            { ar: 'تصوّر المواد والمساعدات فقط من دون أن يظهر أي وجه', en: 'Photograph only the materials and aid without any faces appearing' },
          ],
          correct: 1,
          feedback: {
            ar: 'التصوير من بعيد لا يُلغي الحاجة للموافقة — وجه المصوَّر قابل للتعرّف حتى في صور المجموعات، وقد تعرفه أسرته أو جيرانه. والعودة لاحقاً لأخذ موافقة لا تعيد للشخص حقه في أن يُسأل قبل التصوير لا بعده. أما تصوير المواد وحدها فقد يكون حلاً مؤقتاً لكنه لا يوثّق الإنسان الذي هو قلب العمل. الخيار الصحيح هو تأجيل التصوير: إن لم يكن في البرنامج وقت للموافقة، فإمّا أن يُضمَّن الوقت في التخطيط، أو لا يكون هناك تصوير. الصورة لا تُعوّض موافقة لم تُؤخذ.',
            en: 'Photographing from a distance does not remove the need for consent — faces are identifiable even in group shots, and family or neighbours may recognise the person. Returning later for consent does not restore the right to be asked before photographing, not after. Photographing materials alone may be a temporary solution but it does not document the person who is the heart of the work. The correct choice is to postpone: if the programme has no time for consent, either build that time into planning or there is no photography. A photograph does not compensate for consent not taken.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 2
    {
      id: 'caption',
      tag: { ar: 'الوحدة الثانية', en: 'Module 2' },
      title: { ar: 'التعليق الذي يحفظ الكرامة', en: 'The caption that preserves dignity' },
      lede: {
        ar: 'التعليق يستطيع أن يُكرّم الشخص في الصورة أو يُحوّله إلى مادة دعائية من دون أن يشعر بذلك أو يرضى.',
        en: 'The caption can honour the person in the frame or turn them into promotional material without them realising or consenting.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'الصورة وحدها لا تحكي القصة — التعليق هو من يضع الإطار. نفس الصورة لطفلة تقرأ كتاباً يمكن أن يُعلَّق عليها بـ«نريا تكتشف الكتب للمرة الأولى في مخيّم اللجوء» أو بـ«نريا تحبّ القراءة وتحلم أن تصبح معلمة». التعليق الأول يعرّف نريا بوصفها ضحية في مكان؛ الثاني يعرّفها بوصفها إنساناً له أحلام. كلاهما قد يكونان صحيحَين كوقائع، لكن أحدهما يسرق منها شيئاً لم تُعطِه — هويّتها المختزلة في ظرف. التعليق الجيد لا يعتمد على تضخيم المعاناة ليجعل القصة أكثر تأثيراً في القارئ أو أكثر إثارة للتبرّع. يعتمد على الدقة والصدق، ويصف ما يمكن تحقّقه دون إضافة تفسيرات عاطفية لم يُصرَّح بها.',
            en: 'The image alone does not tell the story — the caption is what frames it. The same photograph of a girl reading a book can be captioned "Naria discovers books for the first time in the refugee camp" or "Naria loves reading and dreams of becoming a teacher." The first caption defines Naria as a victim in a place; the second defines her as a person with dreams. Both may be factually true, but one takes from her something she did not give — an identity reduced to a circumstance. A good caption does not rely on inflating suffering to make the story more moving for a reader or more compelling for a donor. It relies on accuracy and honesty, describing only what can be verified without adding emotional interpretations that were not expressed.',
          },
        },
        {
          type: 'compare',
          yesTitle: { ar: 'تعليق يحفظ الكرامة', en: 'Caption that preserves dignity' },
          noTitle: { ar: 'تعليق يُشكّل مشكلة', en: 'Caption that poses a problem' },
          yes: {
            ar: [
              'الاسم الذي وافق عليه الشخص، أو اسم مستعار اتُّفق عليه إن طلب',
              'وصف ما يفعله في الصورة دون إضافة تفسير عاطفي لم يُصرَّح به',
              'معلومة أذن بها شخصياً وتأكّدت من صحّتها',
              'لغة تصف الشخص وليس ظرفه وحده',
              'سياق يفهمه هو بنفسه لو قرأه دون أن يشعر بالإهانة أو الاستغلال',
            ],
            en: [
              'The name the person agreed to, or a pseudonym agreed on if they requested',
              'Describing what they are doing in the image without adding emotional interpretation they did not express',
              'Information they personally authorised and you verified',
              'Language that describes the person, not only their circumstance',
              'Context they would understand themselves if they read it without feeling insulted or exploited',
            ],
          },
          no: {
            ar: [
              'نسب أقوال أو مشاعر لم يُصرَّح بها',
              'وصف حالة اقتصادية أو عائلية بتفاصيل لم يُشارك بها طوعاً',
              'استخدام كلمات تُعرّف الشخص بمعاناته كـ«المسكين» أو «البائس» أو «المعدم»',
              'تضخيم الوضع لجعله أكثر تأثيراً على القارئ أو المانح',
              'الكشف عن وضع قانوني أو نفسي أو صحّي دون إذن صريح',
            ],
            en: [
              'Attributing statements or feelings they did not express',
              'Describing their financial or family situation in detail they did not voluntarily share',
              'Using words that define them by their hardship such as "poor" or "wretched" or "destitute"',
              'Inflating the situation to make it more affecting for the reader or donor',
              'Revealing a legal, psychological or health status without explicit permission',
            ],
          },
        },
        {
          type: 'text',
          content: {
            ar: 'كثير من مشكلات التعليق تنشأ من فجوة بين نيّة الكاتب وأثر ما يكتب. المتطوّع يريد أن يُظهر للعالم قيمة العمل الذي يقوم به، ويريد أن يُحرّك مشاعر الناس نحو القضية، وهذان هدفان مشروعان. لكن الطريقة التي يُحرَّك بها شعور القارئ يمكن أن تستغلّ الشخص في الصورة أو تكرّمه. المعيار السهل: اقرأ التعليق وتخيّل أن الشخص في الصورة يقرؤه الآن. هل سيشعر أنه مُمثَّل بصدق؟ هل يُفصح عن شيء لم يوافق على الإفصاح عنه؟ هل يُعرّفه بطريقة تُريحه أم تُحرجه؟ هذا الاختبار الذهني لا يستغرق دقيقة ويُجيب عن معظم الأسئلة.',
            en: 'Many caption problems arise from a gap between the writer\'s intention and the effect of what they write. The volunteer wants to show the world the value of the work they do, and wants to move people\'s feelings towards the cause — both are legitimate goals. But the way a reader\'s feelings are moved can either exploit or honour the person in the image. The easy test: read the caption and imagine the person in the photograph reading it now. Will they feel honestly represented? Does it disclose something they did not agree to disclose? Does it describe them in a way that makes them comfortable or uncomfortable? This mental test takes less than a minute and answers most questions.',
          },
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: 'الاستشهاد بدون إذن هو كذب ولو كان صحيحاً', en: 'A quote used without permission is a lie even if accurate' },
          content: {
            ar: 'حين تضع في التعليق جملة كأنها قول الشخص وهو لم يقلها لك بهذا الشكل في هذا السياق، فأنت تكذب حتى لو كانت الجملة تصف ما يشعر به فعلاً. والأسوأ أنك قد تكون مخطئاً فيما تظنّه. الشخص في الصورة قد قال لك جملة دافئة في لحظة، وأنت حوّلتها إلى بيان عن قضية لم يختَر أن يكون ناطقاً باسمها. الاستشهادات المباشرة في التعليقات تحتاج إلى موافقة صريحة على أن هذه الجملة بالذات ستُنشر باسمه في هذا السياق.',
            en: 'When you put a sentence in a caption as if the person said it, but they did not say it to you in those words in that context, you are being dishonest even if the sentence describes how they actually feel. And worse, you may be wrong in what you assume. The person in the photograph may have said something warm to you in a moment, and you have turned it into a statement on a cause they did not choose to speak for. Direct quotations in captions need explicit consent that this exact sentence will be published under their name in this context.',
          },
        },
        {
          type: 'quiz',
          id: 'mc-q2',
          label: { ar: 'تحقّق من فهمك', en: 'Check your understanding' },
          question: {
            ar: 'أيّ التعليقات التالية يحفظ كرامة الشخص في الصورة؟',
            en: 'Which of the following captions best preserves the dignity of the person in the photograph?',
          },
          options: [
            { ar: '«يوسف، ١٢ عاماً، اضطرّ للعمل بعد أن فقد أبوه عمله إثر الأزمة، لكنه لا يزال يؤمن بمستقبل أفضل»', en: '"Youssef, 12, was forced to work after his father lost his job in the crisis, but still believes in a better future"' },
            { ar: '«يوسف يشارك في ورشة المهارات المهنية ضمن برنامج التدريب للشباب في المركز»', en: '"Youssef participates in the vocational skills workshop in the youth training programme at the centre"' },
            { ar: '«يوسف المسكين يعاني من البؤس لكنّ الابتسامة لا تفارق وجهه»', en: '"Poor Youssef suffers from misery but the smile never leaves his face"' },
            { ar: '«الأمل في وجه يوسف يذكّرنا بسبب وجودنا هنا — ادعموا عملنا اليوم»', en: '"The hope in Youssef\'s face reminds us why we are here — support our work today"' },
          ],
          correct: 1,
          feedback: {
            ar: 'الخيار الأول يكشف تفاصيل مالية وعائلية حسّاسة — حتى لو صحيحة، نشرها قرار يخصّ يوسف وأسرته لا أنت. الثالث يُعرّفه بالمعاناة مع «ابتسامة رغم البؤس» وهي صيغة تحوّله إلى رمز تحفيزي يُغيّب إنسانيّته. الرابع يستخدم وجهه أداةً لطلب دعم مالي دون أن يوافق على ذلك — وهو استغلال مباشر. الثاني وحده يصف ما يفعله في الصورة بدقة، ومن دون أن ينسب إليه ما لم يُعطَه أو يكشف ما لم يأذن بكشفه.',
            en: 'The first reveals sensitive financial and family details — even if accurate, publishing them is a decision that belongs to Youssef and his family, not you. The third defines him by suffering with "a smile despite the misery", a formula that makes him a motivational symbol and erases his humanity. The fourth uses his face as a tool to solicit financial support he has not consented to — that is direct exploitation. Only the second describes what he is doing in the image accurately, without attributing anything he did not give or revealing anything he did not authorise.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 3
    {
      id: 'verification',
      tag: { ar: 'الوحدة الثالثة', en: 'Module 3' },
      title: { ar: 'التحقّق من المعلومة قبل النشر', en: 'Verifying information before publishing' },
      lede: {
        ar: 'الرقم الخاطئ الذي نشرته بحسن نيّة يمكن أن يُفقدك مصداقية بنيتها بشهور.',
        en: 'A wrong number you published in good faith can destroy credibility built over months.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'في سياق العمل الإنساني والتطوّعي، تدور أرقام كثيرة عن عدد المستفيدين وحجم الكارثة وكمية المساعدات ونسبة التغطية. بعضها صحيح ومستقى من مصادر موثوقة تملك منهجية لإنتاجه، وبعضها مُضخَّم يدور في مجموعات الواتساب وعلى صفحات التواصل حتى يبدو حقيقياً بقوة التكرار. الفرق بينهما لا يُدرَك بالنظر — يُدرَك بالتحقّق من المصدر. المتطوّع الذي ينشر رقماً سمعه دون أن يتأكّد من مصدره يُؤذي الثقة في منظمته حتى لو كانت نيّته حسنة وحتى لو كان الرقم قريباً من الصحيح. والثقة مرّة ما تُفقد في قضية واحدة تستغرق إعادة بناؤها سنوات في كل القضايا. القاعدة البسيطة: لا تنشر ما لا تستطيع أن تقول من أين جاء وكيف يمكن لأيّ شخص أن يتحقّق منه.',
            en: 'In humanitarian and volunteer work, many figures circulate about beneficiary numbers, disaster scale, aid quantities and coverage rates. Some are accurate and drawn from reliable sources with a methodology for producing them; some are inflated, circling in WhatsApp groups and on social pages until they sound real through repetition. The difference between them is not visible — it is found by verifying the source. The volunteer who publishes a number they heard without confirming its source harms trust in their organisation, however good their intentions and however close the number is to correct. And once trust is lost on a single issue, rebuilding it takes years across all issues. The simple rule: do not publish what you cannot say where it came from and how any person could verify it.',
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'اسأل دائماً: من أصدر هذا الرقم؟ هل هو مصدر رسمي يملك منهجية، أم توقّع شخصي، أم ما يتردّد بين الناس؟',
              'ابحث عن المصدر الأصلي نفسه — ليس ما نشره أحد عنه، بل الوثيقة أو البيان الذي صدر عن الجهة المصدِرة',
              'إذا لم تجد المصدر الأصلي خلال دقيقتين، لا تنشر الرقم — وضع «لم يُتحقّق منه بعد» إن كان لا بدّ من الإشارة',
              'الأرقام الكبيرة جداً لا تكون دائماً خاطئة، والأرقام الصغيرة تُضخَّم هي أيضاً — المعيار ليس الحجم بل مصدر الرقم',
              'إن كان الرقم من داخل منظمتك، تأكّد أن من أعطاك إيّاه يملك صلاحية إصداره ومشاركته خارجياً',
              'الشكّ ليس ضعفاً في هذا السياق — «سأتحقّق وأعود بإجابة» أفضل دائماً من نشر خطأ ثم الاعتذار',
            ],
            en: [
              'Always ask: who issued this number? Is it an official source with a methodology, a personal estimate, or hearsay?',
              'Find the original source itself — not what someone wrote about it, but the document or statement issued by the originating body',
              'If you cannot find the original source in two minutes, do not publish the number — add "not yet verified" if you must reference it',
              'Very large numbers are not always wrong, and small numbers are inflated too — the standard is the source, not the size',
              'If the number comes from within your organisation, confirm the person who gave it has authority to issue and share it externally',
              'Doubt is not weakness in this context — "I\'ll verify and come back with an answer" is always better than publishing an error and apologising',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'warn',
          title: { ar: 'تضخيم الأرقام يؤذي من تريد مساعدتهم', en: 'Inflating figures harms those you want to help' },
          content: {
            ar: 'حين تنشر أن «مئة ألف شخص في خطر» وكان الرقم الحقيقي عشرين ألفاً، لا تخسر أنت فقط — يخسر العشرون ألف أيضاً. المانحون والصحفيون والجهات الحكومية يعتمدون على أرقام المنظمات لتوجيه استجاباتهم وتخصيص مواردهم. رقم مضخَّم يوجّه الموارد نحو أزمة وهمية الحجم، ويُضعف ثقة الجميع في الأرقام الصحيحة لاحقاً. الخداع بالأرقام لا يخدم القضية حتى حين تكون القضية عادلة ويعاني أصحابها فعلاً.',
            en: 'When you publish that "a hundred thousand people are at risk" when the real number is twenty thousand, it is not only you who loses — the twenty thousand lose too. Donors, journalists and government bodies rely on organisations\' figures to direct responses and allocate resources. An inflated number channels resources towards a crisis that is misrepresented in scale, and weakens everyone\'s trust in accurate numbers later. Deceiving with figures does not serve the cause even when the cause is just and the people affected are genuinely suffering.',
          },
        },
        {
          type: 'quiz',
          id: 'mc-q3',
          label: { ar: 'سيناريو ميداني', en: 'Field scenario' },
          question: {
            ar: 'شاركك متطوّع في الواتساب منشوراً يقول إن ٥٠٠ عائلة تضرّرت من الفيضانات وطلب منك إعادة نشره على صفحة المنظمة. المصدر المذكور في المنشور هو «أهالي المنطقة». ماذا تفعل؟',
            en: 'Another volunteer shares a WhatsApp post saying 500 families were affected by the floods and asks you to repost it on the organisation\'s page. The source given in the post is "local residents". What do you do?',
          },
          options: [
            { ar: 'تنشره لأن مصدره أهل المنطقة وهم الأعلم بما حدث', en: 'Post it because the source is local residents who know best what happened' },
            { ar: 'تنشره مع إضافة ملاحظة «الأرقام غير مؤكّدة»', en: 'Post it with a note that the figures are unconfirmed' },
            { ar: 'لا تنشره وتبحث عن رقم رسمي من البلدية أو الدفاع المدني أو منظمة إنسانية معتمدة أولاً', en: 'Do not post it and look for an official figure from the municipality, civil defence or an accredited humanitarian organisation first' },
            { ar: 'تنشره الآن وتحذفه لاحقاً إن ظهر رقم رسمي مختلف', en: 'Post it now and delete it later if an official figure turns out to be different' },
          ],
          correct: 2,
          feedback: {
            ar: 'الصفحة الرسمية للمنظمة تُلزمها بما تنشر. كلمة «غير مؤكّد» لا تكفي عذراً حين يُعاد نشر رقم خاطئ آلاف المرات قبل أن ينتشر التصحيح. و«أهالي المنطقة» ليسوا مصدراً قابلاً للتحقّق — قد يكونون محقّين، وقد يكون الرقم انتشر بينهم بعد تضخيم. ونشر الرقم ثم حذفه لاحقاً أسوأ من عدم النشر أصلاً: النسخة الأولى انتشرت وحُفظت. البلدية والدفاع المدني والمنظمات المعتمدة هي المصادر المناسبة. وإن لم يكن رقم رسمي موجوداً بعد، الجملة الأمينة هي «لا معلومات موثّقة بعد، نتابع».',
            en: 'The organisation\'s official page commits it to what it publishes. "Unconfirmed" is not a sufficient excuse when a wrong number is reshared thousands of times before a correction spreads. And "local residents" is not a verifiable source — they may be right, or the number may have spread among them after being inflated. Posting and then deleting is worse than not posting: the first version already spread and was saved. The municipality, civil defence and accredited organisations are the appropriate sources. And if no official figure yet exists, the honest sentence is "no verified information yet — we are following up".',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 4
    {
      id: 'personal-vs-official',
      tag: { ar: 'الوحدة الرابعة', en: 'Module 4' },
      title: { ar: 'الحساب الشخصي والحساب الرسمي', en: 'The personal account and the official account' },
      lede: {
        ar: 'ما تكتبه من حسابك الشخصي يُقرأ أحياناً باسم منظمتك — وهذا فرق يحتاج إلى وعي مستمر.',
        en: 'What you write from your personal account is sometimes read in your organisation\'s name — a difference that requires constant awareness.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'حين تعمل متطوّعاً في منظمة ويعرف الناس ذلك، يكتسب حسابك الشخصي ظلاً مؤسسياً. ما تنشره عن القضية التي تعمل فيها، وعن المناطق التي تزورها، وعن الفئات التي تخدمها، وعن الأحداث التي تشارك فيها — كل ذلك قد يُقرأ باعتباره موقف المنظمة بغضّ النظر عن نيّتك. حسابك الشخصي ملكك وحرّيتك فيه أصيلة، لكن المسؤولية مزدوجة في هذا السياق: أنت مسؤول أمام ضميرك عن كل ما تكتبه، ومسؤول أمام من تخدمهم عن كل ما قد يُساء فهمه أو يُلحق بهم ضرراً. الفارق الجوهري ليس من يملك الحساب — بل ما طبيعة ما يُنشر: رأي شخصي في قضية عامة لا علاقة له بعمل المنظمة، أم معلومة تتعلق بالمستفيدين أو الشركاء أو العمليات الداخلية.',
            en: 'When you volunteer with an organisation and people know it, your personal account acquires an institutional shadow. What you post about the cause you work in, the areas you visit, the groups you serve, and the events you participate in — all of it may be read as the organisation\'s position regardless of your intention. Your personal account belongs to you and your freedom in it is genuine, but the responsibility is doubled in this context: you are accountable to your conscience for everything you write, and accountable to those you serve for everything that might be misread or cause them harm. The essential distinction is not who owns the account — it is what is published: a personal opinion on a public matter unrelated to the organisation\'s work, or information relating to beneficiaries, partners or internal operations.',
          },
        },
        {
          type: 'grid',
          items: [
            {
              title: { ar: 'الحساب الشخصي — ما يجوز', en: 'The personal account — what is fine' },
              text: {
                ar: 'آراء شخصية في قضايا عامة لا تتعلّق بعمل منظمتك، مشاركات من الحياة اليومية، منشورات بلا صفة رسمية. إن كانت الصلة بالمنظمة واضحة، يُنصح بجملة مثل «الآراء الواردة هنا شخصية ولا تمثّل موقف المنظمة».',
                en: 'Personal opinions on public matters unrelated to your organisation\'s work, everyday life posts, shares without official status. If the connection to the organisation is visible, a sentence such as "views expressed here are personal and do not represent the organisation\'s position" is advisable.',
              },
            },
            {
              title: { ar: 'الحساب الرسمي — قواعد الانضباط', en: 'The official account — the discipline rules' },
              text: {
                ar: 'كل ما يُنشر يمثّل موقف المنظمة رسمياً. كل منشور يمرّ على جهة مخوَّلة. لا أرقام ولا بيانات ولا تصريحات من دون تنسيق. الردّ على التعليقات يتبع خطة تواصل محدّدة، وليس اجتهاداً فردياً مهما كانت النيّة طيّبة.',
                en: 'Everything published officially represents the organisation\'s position. Every post passes through an authorised person. No figures, statements or declarations without coordination. Responses to comments follow a defined communication plan, not individual improvisation however good the intention.',
              },
            },
          ],
        },
        {
          type: 'text',
          content: {
            ar: 'من أكثر المواقف دقّة تلك التي يرى فيها المتطوّع انتقاداً لمنظمته على صفحات التواصل ويشعر بدافع الردّ من حسابه الشخصي. الردّ الشخصي السريع يبدو معقولاً — أنت تعرف الحقيقة وتريد تصحيح الخطأ. لكن ردّك غير المفوَّض يُقرأ باعتباره موقف المنظمة، وإن تضمّن معلومات غير دقيقة أو زاد المنشور الأصلي انتشاراً، فالمشكلة تضاعفت. الإجراء الصحيح هو إبلاغ المسؤول الإعلامي في المنظمة وإرسال رابط المنشور إليه وتركه يردّ من الحساب الرسمي بصياغة متّفق عليها. صمتك المؤقّت أفضل من كلامك الحسن النيّة غير المفوَّض.',
            en: 'One of the most delicate situations is when a volunteer sees criticism of their organisation on social media and feels the impulse to respond from their personal account. The quick personal response seems reasonable — you know the truth and want to correct the error. But your unauthorised response is read as the organisation\'s position, and if it contains inaccurate information or increases the reach of the original post, the problem has multiplied. The correct procedure is to notify the organisation\'s communications lead, send them the link, and let them respond from the official account in agreed wording. Your temporary silence is better than your well-intentioned but unauthorised words.',
          },
        },
        {
          type: 'callout',
          variant: 'warn',
          title: { ar: 'المعلومات الداخلية لا تخرج من أي حساب', en: 'Internal information does not leave through any account' },
          content: {
            ar: 'أرقام المستفيدين الداخلية، ومراسلات الشركاء، ونتائج الاجتماعات، والملاحظات على المتطوّعين أو الموظفين — كل هذه معلومات داخلية لا تُنشر على أيّ حساب سواء أكان شخصياً أم رسمياً، إلا بإذن صريح من جهة مختصة. الفرق بين «من حسابي الشخصي» و«من الحساب الرسمي» لا يُلغي طبيعة المعلومة نفسها. السرّية الداخلية تعني أن المعلومة لا تخرج على الإطلاق، لا أنها تخرج بطريقة أخف وطأة.',
            en: 'Internal beneficiary figures, partner correspondence, meeting outcomes, and notes on volunteers or staff — all of these are internal information not published on any account, personal or official, except with explicit authorisation from a relevant body. The difference between "my personal account" and "the official account" does not change the nature of the information itself. Internal confidentiality means the information does not leave at all, not that it leaves via a lighter channel.',
          },
        },
        {
          type: 'quiz',
          id: 'mc-q4',
          label: { ar: 'سيناريو متشعّب', en: 'A branching scenario' },
          question: {
            ar: 'نشر أحدهم على إنستغرام تعليقاً يهاجم برنامج منظمتك بمعلومات تبدو خاطئة. رأيته أنت أولاً من حسابك الشخصي. ما الإجراء الصحيح؟',
            en: 'Someone posts a comment on Instagram attacking your organisation\'s programme with what appear to be false claims. You spotted it first from your personal account. What is the correct response?',
          },
          options: [
            { ar: 'تردّ فوراً من حسابك الشخصي لتصحيح المعلومات قبل أن تنتشر', en: 'Respond immediately from your personal account to correct the information before it spreads' },
            { ar: 'تُبلّغ المسؤول الإعلامي في المنظمة وترسل له رابط التعليق', en: 'Notify the organisation\'s communications lead and send them the link to the comment' },
            { ar: 'تُعجب بتعليقات المدافعين عن المنظمة في نفس المنشور لتشجيعهم', en: 'Like the comments defending the organisation on the same post to encourage them' },
            { ar: 'تتجاهله لأن التعليقات السلبية تتراجع وحدها عادةً', en: 'Ignore it because negative comments usually die down on their own' },
          ],
          correct: 1,
          feedback: {
            ar: 'الردّ الفوري الشخصي يمنحك إحساساً بالفعل لكنه يُعقّد الموقف: أنت لست المخوَّل بالتحدّث باسم المنظمة، وقد تُضخّم الجدل وتزيد انتشار المنشور الأصلي. الإعجاب بردود الآخرين يبدو محايداً لكنه يعني أن حسابك الشخصي ينشّط المحادثة. والتجاهل يترك المعلومة الخاطئة تعمل. المسؤول الإعلامي لديه سياق أوسع وصلاحية الردّ وصياغة متّفق عليها — وإبلاغه فوراً بخمس دقائق أسرع وأفعل من أي ردّ شخصي.',
            en: 'Responding immediately from your personal account gives a feeling of action but complicates matters: you are not authorised to speak for the organisation, and you may amplify the controversy and spread the original post further. Liking others\' responses seems neutral but means your personal account is activating the conversation. Ignoring it leaves the false information working. The communications lead has broader context, authority to respond, and agreed wording — notifying them immediately in five minutes is faster and more effective than any personal response.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 5
    {
      id: 'protection',
      tag: { ar: 'الوحدة الخامسة', en: 'Module 5' },
      title: { ar: 'حماية الأشخاص في المحتوى الرقمي', en: 'Protecting people in digital content' },
      lede: {
        ar: 'المنشور لا يُمحى من الإنترنت — لكن الضرر الذي يسبّبه يبقى مع الشخص المصوَّر، لا مع من صوَّره.',
        en: 'A post does not disappear from the internet — but the harm it causes stays with the person photographed, not with whoever took the photo.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'ثمة فئات من الناس يُشكّل نشر صورهم أو معلوماتهم خطراً حقيقياً، مباشراً أو غير مباشر: ضحايا العنف، والأشخاص في وضع قانوني هشّ، والأطفال، والناجون من صدمات، والأشخاص الذين هربوا من بيئات تضطهدهم لأسباب دينية أو سياسية أو عائلية. الصورة التي تبدو بريئة تماماً — شخص في نشاط تعليمي أو مهني — قد تُكشف موقعه لأسرة هاجر منها، أو تُعرفه في مجتمع يضطهد ما يمثّله، أو تُعطي معلومة لجهة تبحث عنه. الخطر لا تراه أنت لأنك لا تعيش قصّته ولا تعرف من يراقبه. المبدأ الأساسي في هذه الحالات: في حال الشكّ، لا تنشر. وحين تشكّ في أن حالة بعينها قد تكون خطرة على شخص بعينه، اسأل مشرفك أو مسؤول الحماية في منظمتك قبل أي قرار من دون استثناء.',
            en: 'There are groups of people for whom publishing their image or information creates a real risk, direct or indirect: survivors of violence, people in a precarious legal situation, children, trauma survivors, and people who have fled environments that persecute them for religious, political or family reasons. A seemingly innocent photograph — someone at an educational or vocational activity — might reveal their location to a family they fled, identify them in a community that persecutes what they represent, or provide information to someone looking for them. You cannot see the risk because you do not live their story and do not know who is watching them. The core principle in these situations is: when in doubt, do not publish. And when you suspect a particular situation may be dangerous for a particular person, ask your supervisor or your organisation\'s protection officer before any decision, without exception.',
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'لا تنشر وجه أي شخص في وضع هشّ دون موافقة صريحة مستنيرة، حتى في الصور الجماعية التي يبدو أن الشخص مجرّد وجه في الخلفية',
              'تجنّب ذكر الموقع الجغرافي الدقيق لنشاط يستهدف فئة حسّاسة — «في طرابلس» تحمي أكثر من «في حي الميناء أمام جامع كذا» بكثير',
              'لا تذكر الوضع القانوني للأشخاص (لاجئ، نازح، عديم جنسية) دون إذن صريح وفهم كامل للأثر المحتمل على أمنه',
              'استخدم أدوات الطمس أو التمويه حين يكون المحتوى ضرورياً للتوثيق لكن الوجه لا يجوز نشره',
              'لو أخطأت ونشرت شيئاً لا ينبغي نشره، أبلغ مشرفك فوراً ولا تنتظر حتى تُلاحظ المشكلة — ساعة واحدة تصنع فرقاً',
              'الصور التي تُرسل في مجموعات الواتساب الداخلية ليست خاصة — تعامل معها كما تتعامل مع أي منشور علني لأن كل شخص في المجموعة يستطيع إعادة إرسالها',
            ],
            en: [
              'Do not publish any vulnerable person\'s face without explicit informed consent, even in group photos where the person appears merely as a face in the background',
              'Avoid mentioning the precise geographic location of an activity targeting a sensitive group — "in Tripoli" protects far more than "in the Mina neighbourhood in front of such-and-such mosque"',
              'Do not mention people\'s legal status (refugee, displaced, stateless) without explicit permission and full understanding of the potential impact on their safety',
              'Use blurring or masking tools when the content is necessary for documentation but the face must not be published',
              'If you make a mistake and publish something that should not be there, tell your supervisor immediately — do not wait for the problem to be noticed; one hour makes a difference',
              'Photos sent in internal WhatsApp groups are not private — treat them as you would any public post because every person in the group can forward them',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'stop',
          title: { ar: 'الصورة لا تُمحى من الإنترنت', en: 'An image is not erased from the internet' },
          content: {
            ar: 'حذف المنشور من الصفحة لا يعني حذفه من الإنترنت. الصورة تُحفظ في ذاكرة التخزين المؤقّت، وقد تُفهرس بمحرّكات البحث في الدقائق الأولى، وتُعاد نشرها من حسابات أخرى قبل أن تحذفها. هذا ليس سبباً للشلل والامتناع عن التوثيق — بل سبب لأن يكون قرار النشر صحيحاً من البداية، ومبنياً على موافقة حقيقية لا على حسن النيّة وحده. ما لا تستطيع تحمّل عواقبه إن بقي، لا تنشره أصلاً.',
            en: 'Deleting a post from your page does not mean deleting it from the internet. The image is stored in cache, may be indexed by search engines within the first minutes, and reshared from other accounts before you delete it. This is not a reason for paralysis and refusal to document — it is a reason for the decision to publish to be right from the beginning, built on genuine consent and not good intentions alone. What you cannot bear the consequences of if it stays, do not publish in the first place.',
          },
        },
        {
          type: 'quiz',
          id: 'mc-q5',
          label: { ar: 'قرارك بالميدان', en: 'Your decision in the field' },
          question: {
            ar: 'صوّرت مجموعة من المشاركين في ورشة ونشرت الصورة. بعد ساعة أخبرتك مشاركة أنها في وضع قانوني حسّاس ولم يكن ينبغي لها أن تظهر. ماذا تفعل؟',
            en: 'You photographed a group of participants at a workshop and posted the image. An hour later a participant tells you she is in a sensitive legal situation and should not have appeared. What do you do?',
          },
          options: [
            { ar: 'تحذف الصورة فوراً وتعتذر منها وتعتبر الأمر منتهياً', en: 'Delete the photo immediately, apologise to her, and consider the matter closed' },
            { ar: 'تحذف الصورة فوراً، تُبلّغ مشرفك أو مسؤول الحماية، وتكتب وصفاً لما حدث لمنع التكرار', en: 'Delete the photo immediately, notify your supervisor or protection officer, and write an account of what happened to prevent recurrence' },
            { ar: 'تطمئنها وتتحقّق أولاً من أن المنشور لم يُشارَك من حسابات أخرى قبل الحذف', en: 'Reassure her and first check that the post has not been shared by other accounts before deleting' },
            { ar: 'تُبقي الصورة لكن تُعدّل التعليق بحيث لا يذكر اسمها', en: 'Keep the photo but edit the caption so it no longer mentions her name' },
          ],
          correct: 1,
          feedback: {
            ar: 'الحذف الفوري ضروري لكنه وحده لا يكفي: الصورة ربما شُوهدت وحُفظت في دقائق النشر الأولى. التحقّق من الانتشار مهم لكنه لا يُقدَّم على الحذف — احذف أولاً ثم تابع الانتشار. إبلاغ مسؤول الحماية ضروري لأن الوضع القانوني الحسّاس قد يعني أن ضرراً فعلياً وقع ويحتاج إلى متابعة ومعالجة. والتقرير يمنع التكرار — تحتاج منظمتك أن تعرف كيف وقع هذا الخطأ لتصلح الإجراء الذي أتاح وقوعه. الإبقاء على الصورة مع حذف الاسم لا يحمي وجهها، الذي هو المشكلة الجوهرية.',
            en: 'Immediate deletion is necessary but not sufficient: the image may have been seen and saved within the first minutes of posting. Checking for sharing is important but does not come before deletion — delete first then track the spread. Notifying the protection officer is essential because a sensitive legal situation may mean real harm has occurred and needs follow-up and management. And the account of what happened prevents recurrence — your organisation needs to know how this error occurred to fix the process that allowed it. Keeping the photo and removing her name does not protect her face, which is the core problem.',
          },
        },
        {
          type: 'quiz',
          id: 'mc-q6',
          label: { ar: 'اختبر فهمك', en: 'Test your understanding' },
          question: {
            ar: 'أيّ من الممارسات التالية يحمي بشكل صحيح الأشخاص في المحتوى الرقمي؟',
            en: 'Which of the following practices correctly protects people in digital content?',
          },
          options: [
            { ar: 'نشر الاسم الكامل للشخص مع صورته ليتعرّف إليه المتابعون ويدعموا قصّته', en: 'Publishing the person\'s full name with their image so followers recognise them and support their story' },
            { ar: 'ذكر الحيّ والشارع بدقة حتى يعرف المانحون أين ترسل المساعدات', en: 'Naming the neighbourhood and street precisely so donors know where to send aid' },
            { ar: 'طمس الوجه أو تمويهه حين تكون الصورة ضرورية للتوثيق لكن الشخص لم يوافق على نشر وجهه', en: 'Blurring or masking the face when the image is necessary for documentation but the person has not agreed to their face being published' },
            { ar: 'إرسال الصور في مجموعة واتساب داخلية بدلاً من نشرها علنياً لأن المجموعة محدودة العضوية', en: 'Sending photos in an internal WhatsApp group instead of posting publicly because the group has limited membership' },
          ],
          correct: 2,
          feedback: {
            ar: 'نشر الاسم الكامل مع الصورة يُلغي أي حماية ويُضيف معلومة تُعيّن الشخص. والتحديد الجغرافي الدقيق قد يُعرّضه للخطر حتى لو كانت النيّة مساعدةً. أما مجموعة الواتساب الداخلية فليست خاصة بما يكفي: الصور تُحفظ تلقائياً على أجهزة كل الأعضاء وتُرسل خارج المجموعة بسهولة وبدون إذن. التمويه هو الأداة الصحيحة لأنه يحفظ القيمة التوثيقية للمحتوى في الوقت نفسه الذي يحمي فيه هوية الشخص من أي استخدام مضرّ.',
            en: 'Publishing the full name with the image removes any protection and adds information that identifies the person. Precise geographic detail can expose them to risk even when the intention is to help. And the internal WhatsApp group is not private enough: photos are saved automatically to every member\'s device and forwarded outside the group easily and without permission. Blurring is the correct tool because it preserves the documentary value of the content while protecting the person\'s identity from any harmful use.',
          },
        },
      ],
    },
  ],
};
