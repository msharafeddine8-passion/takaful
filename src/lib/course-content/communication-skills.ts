import type { CourseContent } from './types';

/**
 * Level 1 · Course 2 — Communication Skills.
 * Universal content for any volunteer in any organisation.
 * Status: DRAFT — requires review and approval before publication.
 */
export const communicationSkills: CourseContent = {
  slug: 'communication-skills',
  level: 1,
  minutes: 75,
  passMark: 70,
  title: { ar: 'مهارات التواصل', en: 'Communication Skills' },
  lede: {
    ar: 'كيف تُصغي، وكيف تُفهِم، وكيف تتصرّف حين يشتدّ الموقف — مهارات تخدم عملك التطوعي وحياتك معاً.',
    en: 'How to listen, how to be understood, and what to do when a situation escalates — skills that serve your volunteering and your life alike.',
  },
  outcomes: {
    ar: [
      'تمارس الإصغاء الفعّال وتميّزه عن مجرّد السماع',
      'تستخدم الأسئلة المفتوحة والمغلقة في موضعها',
      'تنتبه إلى لغة جسدك وأثرها قبل أن تتكلّم',
      'تتواصل باحترام مع فئات مختلفة العمر والخلفية',
      'تتعامل مع الغضب والمواقف المشحونة دون تصعيد',
      'تعرف متى تصمت ومتى تُحيل الأمر لغيرك',
    ],
    en: [
      'Practise active listening and distinguish it from merely hearing',
      'Use open and closed questions appropriately',
      'Notice your body language and its effect before you speak',
      'Communicate respectfully across ages and backgrounds',
      'Handle anger and charged situations without escalating',
      'Know when to stay silent and when to refer on',
    ],
  },
  sources: [
    'IFRC Volunteering Policy (August 2022) — volunteer conduct and duty of care',
    'Core Humanitarian Standard on Quality and Accountability (2024 edition) — communication and accountability to affected people',
    'Psychological First Aid: Guide for Field Workers — WHO, War Trauma Foundation and World Vision International',
    'Do No Harm principle in humanitarian action',
  ],

  modules: [
    {
      id: 'listening',
      tag: { ar: 'الوحدة الأولى', en: 'Module 1' },
      title: { ar: 'الإصغاء الفعّال', en: 'Active listening' },
      lede: {
        ar: 'أكثر ما يحتاجه الناس ليس نصيحتك — بل أن يشعروا أن أحداً سمعهم فعلاً.',
        en: 'What people need most is rarely your advice — it is the sense that someone genuinely heard them.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'السماع فعل تلقائي، أما الإصغاء فقرار. الفرق بينهما أنك في الإصغاء تمنح الآخر انتباهك الكامل، وتؤجّل حكمك، وتتحقّق من أنك فهمت قبل أن تردّ.',
            en: 'Hearing is automatic; listening is a decision. The difference is that in listening you give the other person your full attention, suspend your judgement, and check that you have understood before you respond.',
          },
        },
        {
          type: 'grid',
          items: [
            {
              title: { ar: 'انتبه بالكامل', en: 'Give full attention' },
              text: {
                ar: 'أبعد الهاتف. انظر إلى المتحدّث. لا تحضّر ردّك بينما هو يتكلّم.',
                en: 'Put the phone away. Look at the speaker. Do not compose your reply while they are still talking.',
              },
            },
            {
              title: { ar: 'أعد الصياغة', en: 'Reflect back' },
              text: {
                ar: '«يعني إذا فهمت صح، أنت…» — يؤكّد للمتحدّث أنك معه، ويكشف سوء الفهم مبكراً.',
                en: '“So if I understand correctly, you…” — confirms you are with them and surfaces misunderstanding early.',
              },
            },
            {
              title: { ar: 'اسمح بالصمت', en: 'Allow silence' },
              text: {
                ar: 'الصمت ليس فراغاً يجب ملؤه. أحياناً يحتاج الشخص لحظة ليكمل.',
                en: 'Silence is not a gap to be filled. Sometimes a person needs a moment to continue.',
              },
            },
            {
              title: { ar: 'لا تقاطع بالحلول', en: 'Do not jump to solutions' },
              text: {
                ar: 'القفز إلى «اعمل كذا» يُشعر الآخر أنك لم تسمعه، بل استعجلت إنهاء الحديث.',
                en: 'Jumping to “just do this” signals you did not listen — you rushed to end the conversation.',
              },
            },
          ],
        },
        {
          type: 'compare',
          yesTitle: { ar: '✔ إصغاء', en: '✔ Listening' },
          noTitle: { ar: '✘ ليس إصغاءً', en: '✘ Not listening' },
          yes: {
            ar: [
              'تسأل لتفهم أكثر',
              'تلخّص ما سمعته للتأكّد',
              'تحتمل الصمت',
              'تعترف بالمشاعر: «واضح إنه صعب عليك»',
            ],
            en: [
              'Asking to understand more',
              'Summarising what you heard to check',
              'Tolerating silence',
              'Acknowledging feeling: “That sounds hard.”',
            ],
          },
          no: {
            ar: [
              'تنتظر دورك في الكلام فقط',
              'تقارن بتجربتك: «وأنا كمان صار معي…»',
              'تقلّل من الأمر: «ما في شي، بسيطة»',
              'تعطي حلاً قبل أن تفهم المشكلة',
            ],
            en: [
              'Waiting only for your turn to speak',
              'Comparing to yourself: “That happened to me too…”',
              'Minimising: “It’s nothing, don’t worry.”',
              'Offering a solution before understanding the problem',
            ],
          },
        },
        {
          type: 'quiz',
          id: 'c2q1',
          label: { ar: 'تحقّق من فهمك', en: 'Check your understanding' },
          question: {
            ar: 'يحدّثك مستفيد عن ضائقة مرّ بها. أيّ ردّ يعكس إصغاءً فعّالاً؟',
            en: 'Someone tells you about a hardship they went through. Which response reflects active listening?',
          },
          options: [
            { ar: '«ما تزعل، في ناس أوضاعهم أصعب بكتير»', en: '“Don’t be upset — other people have it much worse.”' },
            { ar: '«لازم تعمل كذا وكذا، هيك بتنحلّ»', en: '“You need to do this and this, that will fix it.”' },
            {
              ar: '«سمعتك. إذا فهمت صح، أصعب شي عليك كان… صح؟»',
              en: '“I hear you. If I understood right, the hardest part for you was… is that right?”',
            },
            { ar: '«وأنا كمان صار معي شي شبيه، خليني احكيلك»', en: '“Something similar happened to me — let me tell you.”' },
          ],
          correct: 2,
          feedback: {
            ar: 'إعادة الصياغة تؤكّد للمتحدّث أنك أصغيت فعلاً، وتفتح له باب التصحيح إن أخطأت الفهم. أما المقارنة والتقليل والحلول المتسرّعة فتُغلق الحديث كلها.',
            en: 'Reflecting back confirms you actually listened and lets them correct you if you misread. Comparing, minimising and rushing to solutions all close the conversation down.',
          },
        },
      ],
    },

    {
      id: 'clarity',
      tag: { ar: 'الوحدة الثانية', en: 'Module 2' },
      title: { ar: 'أن تُفهَم كما تقصد', en: 'Being understood as you intend' },
      lede: {
        ar: 'الرسالة ليست ما قلته، بل ما وصل. والمسؤولية عن الوصول مسؤوليتك أنت.',
        en: 'The message is not what you said — it is what arrived. And responsibility for arrival is yours.',
      },
      blocks: [
        {
          type: 'list',
          items: {
            ar: [
              'ابدأ بالخلاصة ثم التفاصيل، لا العكس',
              'استخدم لغة بسيطة وتجنّب المصطلحات المؤسسية',
              'جملة واحدة لكل فكرة — الجمل الطويلة تُفقد المعنى',
              'تحقّق من الوصول: «في شي مش واضح؟» بدل «فهمت؟»',
              'الأرقام والمواعيد تُكرَّر وتُكتَب، لا تُقال مرة واحدة',
            ],
            en: [
              'Lead with the conclusion, then the detail — not the reverse',
              'Use plain language; avoid institutional jargon',
              'One idea per sentence — long sentences lose meaning',
              'Check arrival: “What is not clear?” rather than “Understood?”',
              'Numbers and times are repeated and written down, never said once',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: '💡 لماذا «في شي مش واضح؟» أفضل من «فهمت؟»', en: '💡 Why “What is not clear?” beats “Understood?”' },
          content: {
            ar: 'سؤال «فهمت؟» يضع الآخر في موقف من يعترف بالتقصير، فيجيب «نعم» حتى لو لم يفهم. أما «في شي مش واضح؟» فيفترض أن الغموض في شرحك أنت، فيسهُل عليه السؤال.',
            en: '“Understood?” puts the other person in the position of admitting a failing, so they say “yes” even when they did not follow. “What is not clear?” assumes the gap is in your explanation, which makes it easy for them to ask.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'لغة الجسد تصل قبل الكلام: وضعية الوقوف، تقاطع الذراعين، النظر إلى الهاتف، نبرة الصوت. في كثير من المواقف يتذكّر الناس شعورهم تجاهك أكثر مما يتذكّرون كلماتك.',
            en: 'Body language arrives before words: how you stand, folded arms, glancing at your phone, tone of voice. In many situations people remember how you made them feel far longer than what you said.',
          },
        },
        {
          type: 'quiz',
          id: 'c2q2',
          label: { ar: 'سيناريو ميداني', en: 'Field scenario' },
          question: { ar: 'ما التصرّف الأنسب؟', en: 'What is the most appropriate action?' },
          scenario: {
            ar: 'تشرح لمجموعة كبار سنّ خطوات التسجيل في نشاط. تلاحظ نظرات حائرة، لكن حين سألت «فهمتوا؟» أجاب الجميع بنعم.',
            en: 'You are explaining registration steps to a group of older people. You notice puzzled looks, but when you asked “Understood?” everyone said yes.',
          },
          options: [
            { ar: 'تكمل لأنهم أكّدوا أنهم فهموا', en: 'Continue — they confirmed they understood' },
            {
              ar: 'تعيد الشرح بصوت أعلى وأسرع لتوفير الوقت',
              en: 'Repeat louder and faster to save time',
            },
            {
              ar: 'تعيد بصياغة أبسط، وتسأل «أي خطوة تحبّوا أعيدها؟»، وتكتب الخطوات',
              en: 'Re-explain more simply, ask “Which step shall I go over again?”, and write the steps down',
            },
            { ar: 'تطلب منهم سؤال أبنائهم في البيت', en: 'Tell them to ask their children at home' },
          ],
          correct: 2,
          feedback: {
            ar: 'النظرات الحائرة معلومة أصدق من كلمة «نعم». صياغة السؤال بشكل يفترض الغموض في شرحك، مع دعم مكتوب، يحلّ المشكلة دون إحراج أحد.',
            en: 'Puzzled looks are more reliable data than the word “yes”. Framing the question so the gap sits with your explanation, plus something written, solves it without embarrassing anyone.',
          },
        },
      ],
    },

    {
      id: 'difficult',
      tag: { ar: 'الوحدة الثالثة', en: 'Module 3' },
      title: { ar: 'المواقف الصعبة', en: 'Difficult situations' },
      lede: {
        ar: 'الغضب في الميدان غالباً ليس موجّهاً إليك شخصياً — لكن تصرّفك يحدّد إن كان سيهدأ أم يتصاعد.',
        en: 'Anger in the field is rarely about you personally — but what you do next decides whether it settles or escalates.',
      },
      blocks: [
        {
          type: 'ordered',
          items: {
            ar: [
              'اهدأ أنت أولاً: نفس عميق، صوت منخفض، حركة بطيئة',
              'لا تجادل في الوقائع وأنت في ذروة الانفعال',
              'اعترف بالشعور: «واضح إنك متضايق، وهذا حقّك»',
              'انقل الحديث إلى مكان أهدأ إن أمكن',
              'اذكر ما تستطيع فعله فعلاً — ولا تعد بما لا تملكه',
              'إن تجاوز الموقف حدودك أو شعرت بخطر: انسحب وأبلغ مشرفك فوراً',
            ],
            en: [
              'Calm yourself first: deep breath, lower voice, slow movement',
              'Do not argue the facts at the peak of the emotion',
              'Acknowledge the feeling: “You are clearly upset, and that is fair.”',
              'Move the conversation somewhere quieter if you can',
              'State what you can actually do — never promise what is not yours to give',
              'If it exceeds your role or you feel unsafe: withdraw and tell your supervisor immediately',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'stop',
          title: { ar: '🛑 حدودك ليست ضعفاً', en: '🛑 Your limits are not a weakness' },
          content: {
            ar: 'أنت لست مفاوضاً ولا معالجاً نفسياً ولا جهة قرار. الانسحاب من موقف يتجاوزك وإبلاغ المسؤول ليس فشلاً — بل هو التصرّف المهني الصحيح، ويحمي المستفيد قبل أن يحميك.',
            en: 'You are not a negotiator, a therapist, or a decision-maker. Withdrawing from a situation beyond your role and reporting it is not failure — it is the correct professional action, and it protects the other person before it protects you.',
          },
        },
        {
          type: 'quiz',
          id: 'c2q3',
          label: { ar: 'سيناريو ميداني', en: 'Field scenario' },
          question: { ar: 'ما التصرّف الصحيح؟', en: 'What is the right action?' },
          scenario: {
            ar: 'رجل يرفع صوته أمام الجميع لأن اسمه غير موجود في قائمة المستفيدين، ويتّهم الفريق بالمحاباة. الناس بدأوا يتجمّعون.',
            en: 'A man raises his voice in front of everyone because his name is not on the beneficiary list, accusing the team of favouritism. A crowd is starting to gather.',
          },
          options: [
            {
              ar: 'ترفع صوتك أيضاً لتثبت أن التوزيع عادل',
              en: 'Raise your voice too, to prove the distribution is fair',
            },
            {
              ar: 'تتجاهله وتكمل عملك حتى يتعب ويمشي',
              en: 'Ignore him and carry on until he tires and leaves',
            },
            {
              ar: 'تخفض صوتك، تعترف بانزعاجه، تدعوه جانباً، وتشرح آلية القائمة — وتُبلغ مشرفك',
              en: 'Lower your voice, acknowledge his frustration, invite him aside, explain how the list works — and inform your supervisor',
            },
            {
              ar: 'تعده بأن تضيفه للقائمة لتهدئته الآن',
              en: 'Promise to add him to the list to calm him down now',
            },
          ],
          correct: 2,
          feedback: {
            ar: 'خفض الصوت يكسر التصعيد، والاعتراف بالشعور ينزع فتيل الإحساس بالتجاهل، ونقل الحديث جانباً يزيل الجمهور الذي يغذّي الموقف. أما الوعد بما لا تملكه فيخلق مشكلة أكبر غداً — وهذا مبدأ «لا ضرر» بعينه.',
            en: 'Lowering your voice breaks the escalation, acknowledging the feeling defuses the sense of being dismissed, and moving aside removes the audience feeding the situation. Promising what is not yours to give creates a bigger problem tomorrow — that is Do No Harm in practice.',
          },
        },
      ],
    },
  ],
};
