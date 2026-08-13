import type { CourseContent } from './types';
import { ORG } from '../org';

/**
 * Level 1 · Course 4 — Working with Children.
 * The highest-stakes course in Level 1. Universal content, grounded in the
 * International Child Safeguarding Standards.
 *
 * The reporting contact is read from ORG.safeguardingFocalPoint rather than
 * written out here, so the course and the rest of the site can never disagree
 * about who a volunteer is meant to call.
 */
const focal = ORG.safeguardingFocalPoint;
export const workingWithChildren: CourseContent = {
  slug: 'working-with-children',
  level: 1,
  minutes: 25, // Measured from the content. See volunteering-foundations.
  passMark: 80,
  title: {
    ar: 'حماية الطفل والتعامل الآمن',
    en: 'Child Safeguarding and Safe Conduct',
  },
  lede: {
    ar: 'قواعد غير قابلة للتفاوض تحمي الطفل وتحميك. إن كان عملك التطوعي يقترب من الأطفال بأي شكل، فهذه الدورة شرط لا استثناء فيه.',
    en: 'Non-negotiable rules that protect the child and protect you. If your volunteering brings you anywhere near children, this course is a requirement with no exceptions.',
  },
  outcomes: {
    ar: [
      'تلتزم بالقاعدة الذهبية: لا انفراد بطفل بعيداً عن الأنظار',
      'تميّز السلوك الآمن من السلوك الممنوع في التعامل مع الأطفال',
      'تتواصل مع الطفل بلغة مناسبة لعمره وتحترم خصوصيته',
      'تتعرّف على مؤشرات القلق دون أن تشخّص أو تحقّق',
      'تتصرّف بشكل صحيح إن أفصح لك طفل عن أذى',
      'تعرف قواعد التصوير والنشر ومتى تكون ممنوعة',
      'تدير مجموعة أطفال بحدود واضحة دون عقاب أو إهانة',
      'تتصرّف حين يكون مصدر القلق زميلاً متطوّعاً',
    ],
    en: [
      'Follow the golden rule: never alone with a child out of sight',
      'Distinguish safe behaviour from prohibited behaviour with children',
      'Communicate with a child in age-appropriate language and respect their privacy',
      'Recognise indicators of concern without diagnosing or investigating',
      'Act correctly if a child discloses harm to you',
      'Know the rules on photography and publication, and when they forbid it',
      'Manage a group of children with clear boundaries, without punishment or humiliation',
      'Act when the concern is about a fellow volunteer',
    ],
  },
  sources: [
    'International Child Safeguarding Standards — Keeping Children Safe',
    'UN Convention on the Rights of the Child',
    'IFRC Volunteering Policy (August 2022)',
    'Core Humanitarian Standard on Quality and Accountability (2024 edition)',
    'Do No Harm principle in humanitarian action',
  ],

  modules: [
    {
      id: 'why',
      tag: { ar: 'الوحدة الأولى', en: 'Module 1' },
      title: { ar: 'لماذا هذه القواعد موجودة', en: 'Why these rules exist' },
      lede: {
        ar: 'ليست شكوكاً فيك. هي إطار يحمي الطفل من الأذى، ويحميك أنت من أي اتهام.',
        en: 'This is not suspicion of you. It is a framework that protects children from harm, and protects you from any accusation.',
      },
      blocks: [
        {
          type: 'callout',
          variant: 'stop',
          title: { ar: '🛑 القاعدة الذهبية', en: '🛑 The golden rule' },
          content: {
            ar: 'لا تبقَ منفرداً مع طفل في مكان مغلق أو بعيد عن أنظار الآخرين — أبداً. إن اضطرّتك الظروف، ابقَ في مكان مرئي وأبلغ زميلاً فوراً. هذه القاعدة وحدها تمنع معظم الحوادث، وتحمي كل الأطراف.',
            en: 'Never be alone with a child in a closed space or out of sight of others — ever. If circumstances force it, stay in view and tell a colleague immediately. This single rule prevents most incidents and protects everyone involved.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'تعتمد المنظمات حول العالم المعايير الدولية لحماية الطفل الصادرة عن Keeping Children Safe (إصدار ٢٠٢٤)، وهي مبنية على اتفاقية الأمم المتحدة لحقوق الطفل. الفكرة الجوهرية فيها بسيطة: حماية الطفل ليست مسؤولية شخص واحد، بل نظام من أربعة أركان تعمل معاً.',
            en: 'Organisations worldwide follow the International Child Safeguarding Standards published by Keeping Children Safe (2024 edition), built on the UN Convention on the Rights of the Child. Their core idea is simple: safeguarding is not one person’s responsibility but a system of four pillars working together.',
          },
        },
        {
          type: 'grid',
          items: [
            {
              title: { ar: '١· السياسة', en: '1 · Policy' },
              text: {
                ar: 'التزام مكتوب بمنع الأذى، يوضّح ما يجب فعله عند وقوع حادث.',
                en: 'A written commitment to preventing harm, setting out what happens if an incident occurs.',
              },
            },
            {
              title: { ar: '٢· الأشخاص', en: '2 · People' },
              text: {
                ar: 'مسؤوليات واضحة لكل متطوّع، وتدريب يجعله يفهم ويتصرّف — وهذا أنت الآن.',
                en: 'Clear responsibilities for every volunteer, and training so they understand and act — which is you, right now.',
              },
            },
            {
              title: { ar: '٣· الإجراءات', en: '3 · Procedures' },
              text: {
                ar: 'بيئة آمنة عبر إجراءات تُطبَّق في كل نشاط، لا في المناسبات فقط.',
                en: 'A child-safe environment through procedures applied in every activity, not only on special occasions.',
              },
            },
            {
              title: { ar: '٤· المساءلة', en: '4 · Accountability' },
              text: {
                ar: 'متابعة تضمن التطبيق الفعلي — لأن سياسة لا تُراقَب ليست سياسة.',
                en: 'Monitoring that ensures real application — because a policy nobody checks is not a policy.',
              },
            },
          ],
        },
        {
          type: 'quiz',
          id: 'c4q1',
          label: { ar: 'تحقّق من فهمك', en: 'Check your understanding' },
          question: {
            ar: 'طفل يبكي ويريد التحدّث إليك، والمكان مزدحم وصاخب. ما التصرّف الصحيح؟',
            en: 'A child is crying and wants to talk to you, and the space is crowded and noisy. What is correct?',
          },
          options: [
            {
              ar: 'تأخذه إلى غرفة فارغة قريبة ليرتاح ويتكلّم براحته',
              en: 'Take him to a nearby empty room so he can settle and speak freely',
            },
            {
              ar: 'تنتقل معه إلى طرف القاعة، ضمن مرأى الفريق، وتُعلم زميلاً',
              en: 'Move with him to the side of the hall, in view of the team, and tell a colleague',
            },
            { ar: 'تطلب منه الانتظار حتى ينتهي النشاط', en: 'Ask him to wait until the activity finishes' },
            { ar: 'تخرج معه إلى الشارع بعيداً عن الضجيج', en: 'Step outside with him, away from the noise' },
          ],
          correct: 1,
          feedback: {
            ar: 'الهدوء مطلوب، لكن ليس على حساب الرؤية. البقاء ضمن مرأى الآخرين مع إعلام زميل يحقّق الأمرين معاً. الغرفة الفارغة والشارع كلاهما انفراد بعيداً عن الأنظار — وهو ممنوع مهما حسنت النية.',
            en: 'Quiet is needed, but not at the cost of visibility. Staying within sight of others and telling a colleague achieves both. An empty room and the street are both “alone, out of sight” — prohibited however good the intention.',
          },
        },
      ],
    },

    {
      id: 'conduct',
      tag: { ar: 'الوحدة الثانية', en: 'Module 2' },
      title: { ar: 'السلوك الآمن', en: 'Safe conduct' },
      lede: {
        ar: 'حدود واضحة تجعل تعاملك دافئاً ومهنياً في آن واحد.',
        en: 'Clear boundaries let you be warm and professional at the same time.',
      },
      blocks: [
        {
          type: 'compare',
          yesTitle: { ar: '✔ سلوك آمن', en: '✔ Safe behaviour' },
          noTitle: { ar: '✘ ممنوع منعاً باتاً', en: '✘ Absolutely prohibited' },
          yes: {
            ar: [
              'التعامل في مجموعات وأماكن مفتوحة',
              'لغة محترمة ومناسبة لعمر الطفل',
              'احترام خصوصية الطفل وجسده',
              'معاملة متساوية لجميع الأطفال',
              'إحالة أي قلق إلى مسؤول الحماية في منظمتك',
              'إذن خطّي من وليّ الأمر قبل أي تصوير',
            ],
            en: [
              'Working in groups and open spaces',
              'Respectful, age-appropriate language',
              'Respecting the child’s privacy and body',
              'Treating all children equally',
              'Referring any concern to your organisation’s safeguarding focal point',
              'Written guardian permission before any photography',
            ],
          },
          no: {
            ar: [
              'الانفراد بطفل بعيداً عن الأنظار',
              'أي تلامس جسدي غير ضروري',
              'التواصل الشخصي مع طفل خارج إطار النشاط',
              'تصوير طفل أو نشر صورته دون إذن',
              'وعد الطفل بكتمان سرّ عنك',
              'معاملة تفضيلية أو هدايا لطفل دون غيره',
              'ألفاظ أو مزاح ذو إيحاء مهما بدا بريئاً',
            ],
            en: [
              'Being alone with a child out of sight',
              'Any unnecessary physical contact',
              'Personal contact with a child outside the activity',
              'Photographing or publishing a child’s image without permission',
              'Promising a child you will keep a secret',
              'Favouritism or gifts to one child over others',
              'Suggestive language or joking, however innocent it seems',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'warn',
          title: { ar: '⚠️ لماذا المعاملة التفضيلية ممنوعة؟', en: '⚠️ Why is favouritism prohibited?' },
          content: {
            ar: 'التقرّب الزائد من طفل بعينه — ولو بدافع الشفقة — يعزله عن أقرانه، ويخلق علاقة اعتماد غير صحية، وهو أيضاً النمط الذي يبدأ به من ينوي الإساءة. لهذا تُمنع بصرف النظر عن نيّتك.',
            en: 'Getting especially close to one child — even out of compassion — isolates them from peers, creates unhealthy dependence, and is also the pattern used by those who intend harm. That is why it is prohibited regardless of your intent.',
          },
        },
        {
          type: 'quiz',
          id: 'c4q2',
          label: { ar: 'سيناريو حساس', en: 'Sensitive scenario' },
          question: { ar: 'ما التصرّف الصحيح؟', en: 'What is the right action?' },
          scenario: {
            ar: 'طفلة في التاسعة تعلّقت بك خلال المخيّم، وتطلب أن تجلس بجانبك دائماً وتسألك عن رقم هاتفك لتتصل بك بعد انتهاء النشاط.',
            en: 'A nine-year-old has become attached to you during the camp, always wants to sit beside you, and asks for your phone number to call you after the activity ends.',
          },
          options: [
            {
              ar: 'تعطيها الرقم لأن رفضك سيجرحها وهي متعلّقة بك',
              en: 'Give her the number — refusing would hurt her, and she is attached to you',
            },
            {
              ar: 'ترفض بلطف، توزّع انتباهك على كل الأطفال، وتُعلم مسؤول الحماية بتعلّقها',
              en: 'Decline kindly, spread your attention across all the children, and tell the safeguarding focal point about her attachment',
            },
            { ar: 'تتجنّبها تماماً بقية المخيّم', en: 'Avoid her entirely for the rest of the camp' },
            { ar: 'تعطيها رقم زميلة لك بدلاً من رقمك', en: 'Give her a colleague’s number instead of yours' },
          ],
          correct: 1,
          feedback: {
            ar: 'التواصل الشخصي مع طفل خارج النشاط ممنوع دائماً، وإعطاء رقم زميلة لا يغيّر شيئاً. التجنّب التام يؤذيها أيضاً. التوازن الصحيح: دفء متساوٍ مع الجميع، حدود واضحة، وإبلاغ مسؤول الحماية لأن التعلّق الشديد قد يكون مؤشراً على حاجة أعمق.',
            en: 'Personal contact with a child outside the activity is always prohibited, and giving a colleague’s number changes nothing. Total avoidance also harms her. The right balance: equal warmth for all, clear boundaries, and informing the safeguarding focal point — because strong attachment can signal a deeper need.',
          },
        },
      ],
    },

    {
      id: 'disclosure',
      tag: { ar: 'الوحدة الثالثة · إلزامية', en: 'Module 3 · Mandatory' },
      title: { ar: 'إن أفصح لك طفل', en: 'If a child discloses to you' },
      lede: {
        ar: 'لحظة قد تحدث مرة في حياتك التطوعية — وما تفعله فيها يحدّد الكثير.',
        en: 'A moment that may happen once in your volunteering life — and what you do in it matters enormously.',
      },
      blocks: [
        {
          type: 'ordered',
          items: {
            ar: [
              'أصغِ بهدوء ولا تُظهر صدمة أو حكماً — تعبير وجهك قد يُسكته',
              'لا تَعِد بالسرّية: قل «سأساعدك، وسأخبر شخصاً مسؤولاً يستطيع حمايتك»',
              'لا تحقّق ولا تستجوب: لا أسئلة تفصيلية ولا موجِّهة',
              'طمئنه أن ما حدث ليس ذنبه، وأنه أحسن حين تكلّم',
              'وثّق فوراً ما قاله بكلماته هو، بدقّة، دون تفسير منك',
              'أبلغ مسؤول الحماية في منظمتك في اليوم نفسه',
              'لا تتحدّث عن الأمر مع أحد آخر إطلاقاً',
            ],
            en: [
              'Listen calmly, showing neither shock nor judgement — your face can silence them',
              'Do not promise secrecy: say “I will help you, and I will tell someone responsible who can protect you”',
              'Do not investigate or interrogate: no detailed or leading questions',
              'Reassure them it is not their fault, and that they did the right thing by speaking',
              'Record immediately what they said, in their own words, accurately and without your interpretation',
              'Report to your organisation’s safeguarding focal point the same day',
              'Never discuss the matter with anyone else',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'stop',
          title: { ar: '🛑 لماذا لا تحقّق؟', en: '🛑 Why not investigate?' },
          content: {
            ar: 'الأسئلة التفصيلية قد تجعل الطفل يعيد سرد الحادثة مراراً فيتأذّى نفسياً، وقد توجّه إجابته دون قصد فتُفسد أي إجراء رسمي لاحق. مهمّتك أن تسمع وتوثّق وتُبلّغ — لا أن تتثبّت.',
            en: 'Detailed questions can make a child retell the event repeatedly and be harmed by it, and can unintentionally lead their answer, damaging any later formal process. Your job is to hear, record and report — not to verify.',
          },
        },
        {
          type: 'callout',
          variant: 'warn',
          title: {
            ar: '☎️ إلى مَن تُبلّغ في تكافل',
            en: '☎️ Who you report to at Takaful',
          },
          content: {
            ar: focal
              ? `مسؤول حماية الطفل في جمعية تكافل: ${focal.name} — ${focal.phone}. أبلغ في اليوم نفسه، مهما بدا لك الأمر بسيطاً أو غير مؤكّد. قرار ما إذا كان القلق يستدعي إجراءً ليس قرارك، وليس عليك أن تحمله وحدك. إن تعذّر الوصول، تواصل مع الجمعية على ${ORG.email}.`
              : 'لم يُحدَّد بعد مسؤول حماية الطفل في هذه المنظمة. لا تأخذ هذه الدورة كإجراء كافٍ قبل أن يُحدَّد.',
            en: focal
              ? `Takaful's child safeguarding focal point: ${focal.name} — ${focal.phone}. Report the same day, however small or uncertain the concern seems. Deciding whether it warrants action is not your call, and not yours to carry alone. If you cannot get through, contact the association at ${ORG.email}.`
              : 'This organisation has not yet named a child safeguarding focal point. Do not treat this course as sufficient until it has.',
          },
        },
        {
          type: 'quiz',
          id: 'c4q3',
          label: { ar: 'سيناريو حساس', en: 'Sensitive scenario' },
          question: { ar: 'ما التصرّف الصحيح؟', en: 'What is the right action?' },
          scenario: {
            ar: 'بعد أن أفصح لك طفل عن تعرّضه للضرب في المنزل، تسألك زميلة متطوّعة: «شو حكالك الولد؟ شكله مضايق».',
            en: 'After a child disclosed being hit at home, a fellow volunteer asks you: “What did the boy tell you? He looks upset.”',
          },
          options: [
            {
              ar: 'تخبرها بالتفصيل لأنها زميلة في الفريق ومن حقّها أن تعرف',
              en: 'Tell her in detail — she is a teammate and has a right to know',
            },
            {
              ar: 'تخبرها باختصار فقط دون ذكر الأسماء',
              en: 'Tell her briefly without naming anyone',
            },
            {
              ar: 'تعتذر عن الحديث في الموضوع وتوضّح أنك أبلغت مسؤول الحماية',
              en: 'Decline to discuss it and explain that you have reported to the safeguarding focal point',
            },
            { ar: 'تنكر أن الطفل قال لك شيئاً', en: 'Deny that the child told you anything' },
          ],
          correct: 2,
          feedback: {
            ar: 'المعلومة تُنقل عبر قناة واحدة فقط: مسؤول الحماية. تداولها بين الفريق — ولو بحسن نية أو دون أسماء — يضرّ بالطفل وقد يصل إلى من أساء إليه. والإنكار غير صحيح؛ الصواب هو الوضوح المهني: «لا أستطيع الحديث في هذا، وقد أبلغتُ الجهة المسؤولة».',
            en: 'The information travels through one channel only: the safeguarding focal point. Passing it around the team — even in good faith or without names — harms the child and can reach the person who hurt them. Denial is not right either; the correct stance is professional clarity: “I cannot discuss this, and I have reported it.”',
          },
        },
      ],
    },

    {
      id: 'media',
      tag: { ar: 'الوحدة الرابعة', en: 'Module 4' },
      title: { ar: 'التصوير والنشر', en: 'Photography and publication' },
      lede: {
        ar: 'صورة واحدة قد تعرّض طفلاً وأسرته للخطر أو الوصم. القواعد هنا صارمة لسبب.',
        en: 'A single photograph can expose a child and their family to danger or stigma. The rules here are strict for a reason.',
      },
      blocks: [
        {
          type: 'list',
          items: {
            ar: [
              'لا تصوير دون إذن خطّي مسبق من وليّ الأمر — الموافقة الشفهية لا تكفي',
              'الصور تُسلَّم للمنظمة، ولا تُنشر على حسابك الشخصي إطلاقاً',
              'تشويش الوجه لا يكفي؛ الملابس والمكان والسياق قد تكشف الطفل',
              'لا تصوير في مواقف الضعف: البكاء، تلقّي المساعدة، المرض',
              'الموافقة على المشاركة في النشاط ليست موافقة على التصوير — هما إذنان منفصلان',
              'وليّ الأمر يستطيع سحب موافقته في أي وقت',
            ],
            en: [
              'No photography without prior written guardian permission — verbal consent is not enough',
              'Images are handed to the organisation and never posted to your personal account',
              'Blurring the face is not enough; clothing, place and context can still identify the child',
              'No photography in moments of vulnerability: crying, receiving aid, illness',
              'Consent to take part in an activity is not consent to be photographed — they are separate permissions',
              'A guardian can withdraw consent at any time',
            ],
          },
        },
        {
          type: 'quiz',
          id: 'c4q4',
          label: { ar: 'سيناريو حساس', en: 'Sensitive scenario' },
          question: { ar: 'ما التصرّف الصحيح؟', en: 'What is the right action?' },
          scenario: {
            ar: 'التقطت صورة رائعة لأطفال يضحكون، ووليّ أمر أحدهم قال لك شفهياً «ما في مشكلة صوّر». تريد نشرها على صفحة المنظمة لتوثيق النشاط.',
            en: 'You took a lovely photo of children laughing, and one child’s guardian told you verbally “no problem, go ahead”. You want to post it on the organisation’s page to document the activity.',
          },
          options: [
            {
              ar: 'تنشرها — الإذن الشفهي كافٍ والصورة إيجابية',
              en: 'Post it — verbal permission is enough and the photo is positive',
            },
            {
              ar: 'تنشرها بعد تشويش وجوه الأطفال الذين لا تملك إذنهم',
              en: 'Post it after blurring the faces of children you have no permission for',
            },
            {
              ar: 'تسلّم الصورة للمنظمة ولا تُنشر إلا بعد إذن خطّي من أولياء أمور كل طفل ظاهر فيها',
              en: 'Hand the photo to the organisation; it is published only after written permission from the guardian of every child visible in it',
            },
            { ar: 'تنشرها على حسابك الشخصي بدل صفحة المنظمة', en: 'Post it on your personal account instead of the organisation’s page' },
          ],
          correct: 2,
          feedback: {
            ar: 'الإذن الشفهي غير كافٍ، ولا يغطّي إلا طفلاً واحداً بينما الصورة فيها عدة أطفال. التشويش لا يمنع التعرّف عبر السياق. والحساب الشخصي ممنوع دائماً. القاعدة: الصورة ملك المنظمة، والنشر يحتاج إذناً خطّياً عن كل طفل ظاهر.',
            en: 'Verbal permission is not sufficient, and covers only one child while the photo shows several. Blurring does not prevent identification through context. A personal account is always prohibited. The rule: the image belongs to the organisation, and publication requires written permission for every child shown.',
          },
        },
      ],
    },

    {
      id: 'behaviour',
      tag: { ar: 'الوحدة الخامسة', en: 'Module 5' },
      title: { ar: 'ضبط المجموعة دون إهانة', en: 'Managing a group without humiliation' },
      lede: {
        ar: 'الطفل الذي «يزعج» غالباً يقول شيئاً لا يعرف كيف يقوله. والعقاب يُسكت الصوت ولا يعالج سببه.',
        en: 'A child who “acts up” is usually saying something they cannot say another way. Punishment silences the sound and leaves the cause.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'ضبط مجموعة أطفال ليس فرض هيبة. هو بناء إطار يعرف فيه الطفل ما هو متوقّع منه وما يحدث إن تجاوزه، بحيث لا يحتاج أحد أن يرفع صوته. والأطفال الذين مرّوا بنزوح أو عنف يستجيبون للصراخ بالانسحاب أو بمزيد من التصعيد — لا بالانضباط.',
            en: 'Managing a group of children is not asserting authority. It is building a frame in which a child knows what is expected and what follows if they step past it, so that nobody needs to raise their voice. Children who have been through displacement or violence answer shouting with withdrawal or with more escalation — never with compliance.',
          },
        },
        {
          type: 'compare',
          yesTitle: { ar: '✔ ما يصنع مجموعة هادئة', en: '✔ What makes a calm group' },
          noTitle: { ar: '✘ ممنوع دائماً', en: '✘ Always prohibited' },
          yes: {
            ar: [
              'قواعد قليلة وواضحة تُقال في البداية',
              'تنبيه الطفل باسمه وبهدوء، على انفراد إن أمكن',
              'إعطاؤه خياراً بدل أمر: «بتحبّ تساعدني هون ولا تكمّل هونيك؟»',
              'ملاحظة السلوك الجيّد بصوت عالٍ — المدح أقوى من التوبيخ',
              'إخراجه من الموقف دقيقة ليهدأ، مع بقائه في مجال النظر',
            ],
            en: [
              'A few clear rules, said at the start',
              'Speaking to the child by name and calmly, one to one where possible',
              'Offering a choice rather than an order: “would you rather help me here, or carry on there?”',
              'Naming good behaviour out loud — praise works harder than reprimand',
              'Stepping them out of the moment to settle, while staying in sight',
            ],
          },
          no: {
            ar: [
              'أي عقاب جسدي مهما بدا خفيفاً',
              'الصراخ أو الإهانة أو السخرية أمام المجموعة',
              'الحرمان من طعام أو ماء أو استخدام الحمّام',
              'العزل في غرفة مغلقة أو بعيداً عن الأنظار',
              'التهديد بإبلاغ الأهل كوسيلة ضغط',
              'المقارنة بطفل آخر أو وصفه بصفة: «الشقي»، «الكسول»',
            ],
            en: [
              'Any physical punishment, however light it seems',
              'Shouting, insulting, or mocking in front of the group',
              'Withholding food, water, or use of the toilet',
              'Isolating a child in a closed room or out of sight',
              'Threatening to tell their parents as leverage',
              'Comparing them to another child, or labelling them: “the difficult one”, “lazy”',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'warn',
          title: { ar: '⚠️ السلوك الصعب قد يكون مؤشّراً', en: '⚠️ Difficult behaviour can be an indicator' },
          content: {
            ar: 'تغيّر مفاجئ في سلوك طفل — عدوانية جديدة، انسحاب، خوف من شخص بعينه، رفض العودة إلى البيت — ليس مسألة انضباط. سجّله وأبلغ المسؤول عن الحماية. أنت لا تحقّق ولا تستنتج، لكنك ترى ما قد لا يراه غيرك.',
            en: 'A sudden change in a child’s behaviour — new aggression, withdrawal, fear of one particular person, refusing to go home — is not a discipline matter. Record it and tell the safeguarding focal point. You do not investigate and you do not conclude, but you see what others may not.',
          },
        },
        {
          type: 'quiz',
          id: 'c4q5',
          label: { ar: 'سيناريو ميداني', en: 'Field scenario' },
          question: { ar: 'ما التصرّف الصحيح؟', en: 'What is the right action?' },
          scenario: {
            ar: 'طفل في العاشرة يقاطع النشاط باستمرار ويدفع الأطفال الآخرين. حاولت تنبيهه مرّتين ولم يتغيّر شيء، والمجموعة بدأت تنزعج.',
            en: 'A ten-year-old keeps interrupting the activity and pushing the other children. You have spoken to him twice and nothing has changed, and the group is getting restless.',
          },
          options: [
            {
              ar: 'تُخرجه من القاعة ويجلس وحده في الممرّ حتى ينتهي النشاط',
              en: 'Send him out of the hall to sit alone in the corridor until the activity ends',
            },
            {
              ar: 'تتجاهله تماماً حتى يملّ',
              en: 'Ignore him completely until he gets bored',
            },
            {
              ar: 'تطلب من زميل متابعة المجموعة، وتجلس معه جانباً ضمن مجال النظر، وتسأله ما الذي يزعجه، وتسجّل ما لاحظته لاحقاً',
              en: 'Ask a colleague to hold the group, sit with him aside but within sight, ask what is bothering him, and record what you noticed afterwards',
            },
            {
              ar: 'تخبره أنك ستتصل بوالده إن لم يتوقّف',
              en: 'Tell him you will call his father if he does not stop',
            },
          ],
          correct: 2,
          feedback: {
            ar: 'الإخراج إلى الممرّ يعزله بعيداً عن الأنظار — وهذا يخالف القاعدة الذهبية ويحرمه من الحماية معاً. التجاهل يترك الأطفال الآخرين يُدفعون. والتهديد بالأهل قد يكون أخطر ما تقوله إن كان البيت نفسه مصدر المشكلة. الجلوس جانباً ضمن النظر يحفظ القاعدة، ويعطيه اهتماماً قد يكون هو ما يطلبه، ويعطيك معلومة تُسجَّل.',
            en: 'Sending him to the corridor isolates him out of sight — breaking the golden rule and removing his protection at the same time. Ignoring it leaves the other children being pushed. Threatening to call his father may be the most dangerous thing you could say if home is the problem. Sitting aside within sight keeps the rule, gives him the attention he may be asking for, and gives you something worth recording.',
          },
        },
      ],
    },

    {
      id: 'colleagues',
      tag: { ar: 'الوحدة السادسة · إلزامية', en: 'Module 6 · Mandatory' },
      title: { ar: 'حين يكون القلق من زميل', en: 'When the concern is a colleague' },
      lede: {
        ar: 'أصعب بلاغ هو البلاغ عن شخص تعرفه وتحبّه. وهو البلاغ الذي بُنيت هذه القواعد كلّها لأجله.',
        en: 'The hardest report to make is about someone you know and like. It is also the report all of these rules exist for.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'معظم الإساءة للأطفال في المؤسسات لا تأتي من غريب، بل من شخص موثوق داخلها. ولهذا فإن الصمت «حفاظاً على سمعة الجمعية» هو بالضبط ما يسمح باستمرارها. الجمعية التي تُبلغ عن حالة داخلها أكثر أماناً من التي لم يُبلَّغ فيها عن شيء أبداً.',
            en: 'Most abuse of children in institutions does not come from a stranger — it comes from a trusted person inside. Which is why staying silent “to protect the association’s reputation” is precisely what allows it to continue. An organisation that reports a case inside itself is safer than one where nothing was ever reported.',
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'أبلغ عن السلوك الذي رأيته، لا عن استنتاجك عن الشخص',
              'أبلغ ولو كنت غير متأكّد — تقدير الموقف ليس دورك',
              'لا تواجه الزميل بنفسك ولا تحذّره أنك ستبلغ',
              'لا تناقش الأمر مع بقيّة المتطوّعين — هذا يفسد أي إجراء لاحق',
              'اكتب ما رأيته بالتاريخ والوقت والمكان في اليوم نفسه',
              'إن كان القلق من المسؤول عن الحماية نفسه، أبلغ من هو أعلى منه',
              'الإبلاغ بحسن نيّة محميّ، حتى لو تبيّن لاحقاً أن لا شيء في الأمر',
            ],
            en: [
              'Report the behaviour you saw, not your conclusion about the person',
              'Report even if you are unsure — weighing it up is not your role',
              'Do not confront the colleague yourself, and do not warn them you are reporting',
              'Do not discuss it with the other volunteers — that compromises any process that follows',
              'Write down what you saw, with date, time and place, the same day',
              'If the concern is about the safeguarding focal point themselves, report to whoever is above them',
              'A report made in good faith is protected, even if it turns out there was nothing in it',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'stop',
          title: { ar: '🛑 إلى من تبلّغ', en: '🛑 Who you report to' },
          content: {
            // Same guard as module 3: a course that tells a volunteer four
            // times to report has to name someone, and if nobody is named it
            // must say so rather than print an empty line.
            ar: focal
              ? `المسؤول عن حماية الطفل في الجمعية: <b>${focal.name}</b> — ${focal.phone}. أبلغ في اليوم نفسه، ولا تنتظر «حتى تتأكّد». إن تعذّر الوصول، أبلغ أي عضو من الإدارة فوراً. وإن كان الطفل في خطر مباشر، فالاتصال بالطوارئ يسبق كل شيء.`
              : 'لم تُسمِّ الجمعية بعد مسؤولاً عن حماية الطفل. لا تعتبر هذه الدورة كافية قبل أن تفعل.',
            en: focal
              ? `The association’s child safeguarding focal point: <b>${focal.name}</b> — ${focal.phone}. Report the same day, and do not wait until you are sure. If you cannot reach them, tell any member of management at once. And if a child is in immediate danger, calling emergency services comes before anything else.`
              : 'This organisation has not yet named a child safeguarding focal point. Do not treat this course as sufficient until it has.',
          },
        },
        {
          type: 'quiz',
          id: 'c4q6',
          label: { ar: 'سيناريو ميداني', en: 'Field scenario' },
          question: { ar: 'ما التصرّف الصحيح؟', en: 'What is the right action?' },
          scenario: {
            ar: 'لاحظت أن متطوّعاً زميلاً — شخص محبوب وقديم في الجمعية — يصطحب طفلاً بمفرده إلى غرفة المخزن أكثر من مرّة، ويعطيه هدايا صغيرة لا يعطيها لغيره.',
            en: 'You notice a fellow volunteer — well-liked, long-standing in the association — taking one child alone to the store room more than once, and giving him small gifts he gives to no one else.',
          },
          options: [
            {
              ar: 'تراقب أكثر قبل أن تبلّغ، حتى تتأكّد أن هناك شيئاً فعلاً',
              en: 'Watch a while longer before reporting, until you are sure there is really something',
            },
            {
              ar: 'تتحدّث معه على انفراد وتسأله عن سبب ذلك',
              en: 'Speak to him privately and ask why he is doing it',
            },
            {
              ar: 'تُبلغ المسؤول عن الحماية اليوم نفسه بما رأيته بالتحديد، وتكتبه، ولا تناقشه مع أحد آخر',
              en: 'Tell the safeguarding focal point the same day exactly what you saw, write it down, and discuss it with nobody else',
            },
            {
              ar: 'تسأل متطوّعين آخرين إن لاحظوا الشيء نفسه',
              en: 'Ask other volunteers whether they noticed the same thing',
            },
          ],
          correct: 2,
          feedback: {
            ar: 'ما رأيته يخالف القاعدة الذهبية ويحمل ثلاثة مؤشّرات معروفة معاً: الانفراد، والمكان بعيداً عن الأنظار، والتفضيل بالهدايا. «أراقب أكثر» تعني أسابيع إضافية من الخطر إن كان القلق في محلّه. ومواجهته تحذّره وتتيح له تغيير سلوكه أو الضغط على الطفل. وسؤال الزملاء يحوّل الأمر إلى شائعة تفسد أي تحقيق. أنت لا تتّهم أحداً — أنت تنقل ما رأيت لمن دوره أن يقرّر.',
            en: 'What you saw breaks the golden rule and carries three recognised indicators at once: being alone, a place out of sight, and singling one child out with gifts. “Watching longer” means additional weeks of risk if the concern is well founded. Confronting him warns him, letting him change his behaviour or lean on the child. Asking colleagues turns it into a rumour that wrecks any process. You are not accusing anyone — you are passing what you saw to the person whose job it is to decide.',
          },
        },
      ],
    },
  ],
};
