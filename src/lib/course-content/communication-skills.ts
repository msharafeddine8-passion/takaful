import type { CourseContent } from './types';

/**
 * Level 1 · Course 2 — Communication Skills.
 * Universal content for any volunteer in any organisation.
 *
 * Six modules, matching the length this course claims. It ran for a while at
 * three, which made "75 minutes" a promise the content did not keep.
 */
export const communicationSkills: CourseContent = {
  slug: 'communication-skills',
  level: 1,
  minutes: 25, // Measured from the content. See volunteering-foundations.
  passMark: 70,
  title: {
    ar: 'التواصل الفعّال',
    en: 'Effective Communication',
  },
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
      'تتواصل عبر الهاتف والرسائل بما لا يُساء فهمه',
      'تنقل خبراً صعباً أو رفضاً دون أن تكسر من أمامك',
      'تحمي ما يُقال لك بثقة، وتعرف حدود ما تعد به',
    ],
    en: [
      'Practise active listening and distinguish it from merely hearing',
      'Use open and closed questions appropriately',
      'Notice your body language and its effect before you speak',
      'Communicate respectfully across ages and backgrounds',
      'Handle anger and charged situations without escalating',
      'Know when to stay silent and when to refer on',
      'Communicate by phone and message without being misread',
      'Deliver bad news or a refusal without breaking the person in front of you',
      'Protect what is told to you in confidence, and know the limits of what you can promise',
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

    {
      id: 'remote',
      tag: { ar: 'الوحدة الرابعة', en: 'Module 4' },
      title: { ar: 'الهاتف والرسائل', en: 'Phone and messages' },
      lede: {
        ar: 'الرسالة المكتوبة تصل بلا نبرة. القارئ يضع النبرة من عنده — وغالباً يضع أسوأ احتمال.',
        en: 'A written message arrives without a tone. The reader supplies one — and usually supplies the worst available.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'معظم عمل التنسيق اليوم يجري بالرسائل. وهذا يعني أن نصف سوء الفهم في الفرق يبدأ من جملة كُتبت على عجل. القاعدة الأولى: إن كان الموضوع حسّاساً أو طويلاً أو فيه خلاف — اتّصل، ولا تكتب.',
            en: 'Most coordination now happens by message, which means half the misunderstandings in a team begin with a sentence written in a hurry. First rule: if the matter is sensitive, long, or contested — call, do not type.',
          },
        },
        {
          type: 'compare',
          yesTitle: { ar: '✔ رسالة واضحة', en: '✔ A clear message' },
          noTitle: { ar: '✘ رسالة تُنتج أسئلة', en: '✘ A message that generates questions' },
          yes: {
            ar: [
              'تبدأ بالمطلوب: «بحاجة جوابك قبل الخميس»',
              'سؤال واحد في الرسالة الواحدة',
              'تذكر الوقت والمكان كاملَين لا «بكرا الصبح»',
              'تُنهى بما تتوقّعه: «أكّدلي إذا بتقدر»',
            ],
            en: [
              'Starting with the ask: “I need your answer before Thursday”',
              'One question per message',
              'Giving the full time and place, not “tomorrow morning”',
              'Ending with what you expect: “confirm if you can make it”',
            ],
          },
          no: {
            ar: [
              '«مرحبا» ثم انتظار الردّ قبل قول الموضوع',
              'خمسة أسئلة في فقرة واحدة',
              'إرسال قرار مهم في مجموعة فيها ثلاثون شخصاً',
              'الردّ بعلامة إعجاب على سؤال يحتاج جواباً',
            ],
            en: [
              '“Hello” and then waiting for a reply before saying what it is about',
              'Five questions in one paragraph',
              'Sending an important decision to a group of thirty',
              'Reacting with a thumbs-up to a question that needed an answer',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'warn',
          title: { ar: '⚠️ ما لا يُكتب في مجموعة', en: '⚠️ What does not go in a group chat' },
          content: {
            ar: 'أسماء المستفيدين، صور الأطفال، تفاصيل حالة عائلة، أرقام هواتف الناس، وأي شكوى عن زميل. المجموعة تُصوَّر شاشتها وتُعاد مشاركتها، وما كُتب فيها لا يمكن سحبه. إن احتجت أن تذكر حالة، استخدم القناة الرسمية أو تحدّث مباشرةً.',
            en: 'Beneficiaries’ names, photographs of children, details of a family’s situation, people’s phone numbers, and any complaint about a colleague. Group chats get screenshotted and forwarded, and what is written there cannot be pulled back. If you need to raise a case, use the official channel or speak directly.',
          },
        },
        {
          type: 'quiz',
          id: 'c2q4',
          label: { ar: 'تحقّق من فهمك', en: 'Check your understanding' },
          question: {
            ar: 'أرسلت رسالة لزميل تسأله عن تأخّر تقرير، فردّ بجملة قصيرة جافّة. شعرت أنه منزعج منك. ما الأنسب؟',
            en: 'You message a teammate about a late report and get a short, blunt reply. You feel he is annoyed with you. What is most appropriate?',
          },
          options: [
            {
              ar: 'تردّ بجفاء مماثل حتى يفهم أن أسلوبه غير مقبول',
              en: 'Reply just as bluntly so he understands his tone is unacceptable',
            },
            {
              ar: 'تفترض حسن النيّة، وإن بقي الشعور تتصل به أو تسأله وجهاً لوجه',
              en: 'Assume good intent, and if the feeling persists, call him or ask face to face',
            },
            {
              ar: 'تشكو منه في مجموعة الفريق لترى إن كان يعامل غيرك هكذا',
              en: 'Raise it in the team group to see whether he treats others this way',
            },
            {
              ar: 'تتوقّف عن مراسلته وتتعامل مع القائد فقط',
              en: 'Stop messaging him and deal only with the lead',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'الرسالة القصيرة تعني في الغالب أن كاتبها مشغول، لا أنه غاضب — لكن النصّ لا يحمل هذا. افتراض حسن النيّة يكلّفك لا شيء إن كنت مخطئاً، ويوفّر خلافاً كاملاً إن كنت مصيباً. وإن بقي الانزعاج فمكانه مكالمة لا رسالة أخرى، لأن الوسيط نفسه هو أصل المشكلة.',
            en: 'A short message usually means the sender is busy, not angry — but text does not carry that. Assuming good intent costs you nothing if you are wrong and saves an entire quarrel if you are right. If the unease persists, its place is a call rather than another message, because the medium is the problem.',
          },
        },
      ],
    },

    {
      id: 'bad-news',
      tag: { ar: 'الوحدة الخامسة', en: 'Module 5' },
      title: { ar: 'الخبر الصعب والرفض', en: 'Bad news and saying no' },
      lede: {
        ar: 'أصعب ما يقوله متطوّع ليس «لا أعرف»، بل «لا نستطيع». وقولها بوضوح أرحم من تركها معلّقة.',
        en: 'The hardest thing a volunteer says is not “I don’t know” — it is “we can’t”. Saying it plainly is kinder than leaving it hanging.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'حين لا تستطيع الجمعية تقديم خدمة، فإن أسوأ ردّ هو الغموض: «سنرى»، «إن شاء الله»، «سأحاول». هذه الجمل تُبقي الأسرة تنتظر أسبوعين قبل أن تبحث عن حلّ آخر — وأسبوعان قد يكونان كلّ الفارق. الوضوح المبكر احترام، لا قسوة.',
            en: 'When the association cannot provide something, the worst answer is a vague one: “we’ll see”, “God willing”, “I’ll try”. Those sentences keep a family waiting a fortnight before they look elsewhere — and a fortnight can be the whole difference. Being clear early is respect, not harshness.',
          },
        },
        {
          type: 'ordered',
          items: {
            ar: [
              'قل الجواب أولاً، لا بعد ثلاث جمل تمهيد',
              'اذكر السبب باختصار وبصدق، دون تفاصيل داخلية لا تخصّهم',
              'لا تلقِ اللوم على «الإدارة» أو «النظام» — أنت تمثّل الجمعية',
              'اذكر ما تستطيعه فعلاً، إن كان هناك شيء',
              'دلّهم على جهة أخرى إن كنت تعرف واحدة موثوقة',
              'لا تعتذر خمس مرّات — الاعتذار المتكرّر يبدو كأنك تطلب منهم أن يواسوك',
            ],
            en: [
              'Give the answer first, not after three sentences of preamble',
              'State the reason briefly and honestly, without internal detail that is not theirs',
              'Do not blame “management” or “the system” — you represent the association',
              'Say what you genuinely can do, if there is anything',
              'Point them to another organisation if you know a reliable one',
              'Do not apologise five times — repeated apology reads as asking them to comfort you',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'stop',
          title: { ar: '🛑 لا تعد بما ليس بيدك', en: '🛑 Never promise what is not yours' },
          content: {
            ar: 'الوعد الذي يُخلَف يكلّف أكثر من الرفض الصريح بكثير. أسرة رُفض طلبها بوضوح تبحث عن بديل؛ أسرة وُعدت ولم يصلها شيء تفقد ثقتها بكل منظمة بعدها، ومنهم من كان سيساعدها فعلاً. هذا ضرر تسبّبنا به نحن.',
            en: 'A broken promise costs far more than a clear refusal. A family refused clearly looks for an alternative; a family promised and left with nothing loses trust in every organisation that comes after — including one that would genuinely have helped. That is harm we caused.',
          },
        },
        {
          type: 'quiz',
          id: 'c2q5',
          label: { ar: 'سيناريو ميداني', en: 'Field scenario' },
          question: { ar: 'ما التصرّف الصحيح؟', en: 'What is the right action?' },
          scenario: {
            ar: 'أمّ تسألك إن كانت الجمعية ستقدّم مساعدة مدرسية لابنها هذا العام. أنت تعرف أن البرنامج لم يُعتمد بعد وأن التمويل غير مؤكّد.',
            en: 'A mother asks whether the association will provide school support for her son this year. You know the programme is not approved and the funding is uncertain.',
          },
          options: [
            {
              ar: '«أكيد، بس استنّي شوي» — لتطمئنها الآن',
              en: '“Of course, just wait a little” — to reassure her now',
            },
            {
              ar: '«ما بعرف» وتنهي الحديث',
              en: '“I don’t know”, and end the conversation',
            },
            {
              ar: 'تقول إن البرنامج غير مؤكّد هذا العام، وإنك ستسأل وتعود بجواب في موعد محدّد، وتنصحها بألّا تنتظرنا وحدنا',
              en: 'Say the programme is not confirmed this year, that you will ask and come back with an answer by a named date, and advise her not to wait on us alone',
            },
            {
              ar: 'تحيلها إلى القائد دون أن تقول شيئاً',
              en: 'Refer her to the lead without saying anything',
            },
          ],
          correct: 2,
          feedback: {
            ar: 'الجواب الثالث يعطيها ثلاثة أشياء تحتاجها: الحقيقة كما هي الآن، وموعداً تعرف عنده أين تقف، ونصيحة تحميها من تعليق مصير ابنها على احتمال. «أكيد» وعد لا تملكه، و«ما بعرف» صحيح لكنه يتركها بلا شيء، والإحالة الصامتة تؤجّل السؤال ولا تجيبه.',
            en: 'The third answer gives her the three things she needs: the truth as it stands, a date by which she will know, and advice that protects her from staking her son’s year on a maybe. “Of course” is a promise that is not yours, “I don’t know” is true but leaves her with nothing, and a silent referral postpones the question rather than answering it.',
          },
        },
      ],
    },

    {
      id: 'confidence',
      tag: { ar: 'الوحدة السادسة', en: 'Module 6' },
      title: { ar: 'السرّ وحدوده', en: 'Confidence and its limits' },
      lede: {
        ar: 'حين يثق بك أحدهم بشيء، تصبح مسؤولاً عنه. والمسؤولية تعني أحياناً أن تنقله — لا أن تدفنه.',
        en: 'When someone trusts you with something, you become responsible for it. Sometimes that responsibility means passing it on — not burying it.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'المتطوّع يسمع أشياء لا تُقال لغيره: ضيق مالي، خلاف عائلي، مرض، خوف. القاعدة أن ما يُقال لك في سياق عملك يبقى في حدود من يحتاج معرفته للمساعدة — لا في حدودك أنت وحدك، ولا في حدود من تعرفهم.',
            en: 'A volunteer hears things nobody else is told: money trouble, a family rift, illness, fear. The rule is that what is said to you in the course of your work stays within those who need it to help — not with you alone, and not with whoever you happen to know.',
          },
        },
        {
          type: 'grid',
          items: [
            {
              title: { ar: 'يبقى عندك', en: 'Stays with you' },
              text: {
                ar: 'تفاصيل شخصية لا علاقة لها بالخدمة: خلاف مع الجيران، رأي سياسي، ماضٍ عائلي.',
                en: 'Personal detail with no bearing on the service: a quarrel with neighbours, a political view, family history.',
              },
            },
            {
              title: { ar: 'يُنقل لمن يقرّر', en: 'Goes to whoever decides' },
              text: {
                ar: 'ما يغيّر شكل المساعدة: عدد الأولاد، وضع صحّي يؤثّر على النشاط، حاجة عاجلة.',
                en: 'Anything that changes the help given: number of children, a health condition affecting an activity, an urgent need.',
              },
            },
            {
              title: { ar: 'يُنقل فوراً وإلزاماً', en: 'Goes on at once, without exception' },
              text: {
                ar: 'أي خطر على طفل أو شخص: إساءة، عنف، تهديد، إيذاء نفس. هذا ليس سرّاً يُحفظ.',
                en: 'Any danger to a child or an adult: abuse, violence, a threat, self-harm. This is not a secret to keep.',
              },
            },
            {
              title: { ar: 'لا يُنقل أبداً خارج الجمعية', en: 'Never leaves the association' },
              text: {
                ar: 'أي منه لأصدقائك أو عائلتك أو على وسائل التواصل، ولو بلا اسم — القرية تعرف من تقصد.',
                en: 'Any of it to friends, family or social media, even unnamed — a small town knows who you mean.',
              },
            },
          ],
        },
        {
          type: 'callout',
          variant: 'stop',
          title: { ar: '🛑 لا تعد بسرّية مطلقة', en: '🛑 Never promise absolute secrecy' },
          content: {
            ar: 'لا تقل أبداً «احكيلي وما رح خبّر حدا». إن أخبرك أحدهم بعدها عن خطر، فأنت بين خيانة وعدك أو ترك شخص في خطر. الصيغة الصحيحة: <b>«ما بتحكيلي بيبقى بيني وبينك، إلا إذا في حدا بخطر — وقتها لازم خبّر مين بيقدر يحمي، وبخبرك قبل ما إعمل.»</b>',
            en: 'Never say “tell me and I won’t tell anyone”. If they then disclose a danger, you are left choosing between breaking your word and leaving someone at risk. The right form is: <b>“what you tell me stays between us, unless someone is in danger — then I must tell whoever can protect them, and I will tell you before I do.”</b>',
          },
        },
        {
          type: 'quiz',
          id: 'c2q6',
          label: { ar: 'سيناريو ميداني', en: 'Field scenario' },
          question: { ar: 'ما التصرّف الصحيح؟', en: 'What is the right action?' },
          scenario: {
            ar: 'مراهقة في نشاط أخبرتك أن والدها فقد عمله وأن الوضع في البيت صعب، وطلبت منك ألّا تخبر أحداً لأنها تخجل.',
            en: 'A teenager at an activity tells you her father lost his job and things at home are hard, and asks you not to tell anyone because she is embarrassed.',
          },
          options: [
            {
              ar: 'تعدها بألّا تخبر أحداً إطلاقاً وتحفظ السرّ',
              en: 'Promise never to tell anyone and keep the secret',
            },
            {
              ar: 'تخبر منسّقة البرنامج فوراً باسمها لتُدرَج على قائمة المساعدة',
              en: 'Tell the programme coordinator her name at once so she is added to the assistance list',
            },
            {
              ar: 'تشكرها على ثقتها، وتشرح لها أنك ستذكر لمنسّقة البرنامج أن هناك أسرة قد تحتاج دعماً وتسألها إن كانت توافق أن تُذكر باسمها',
              en: 'Thank her for the trust, explain you will mention to the coordinator that a family may need support, and ask whether she agrees to be named',
            },
            {
              ar: 'تنصحها بالتحدّث إلى أهلها وتترك الأمر',
              en: 'Advise her to talk to her parents and leave it there',
            },
          ],
          correct: 2,
          feedback: {
            ar: 'ليس هنا خطر يستدعي الإبلاغ الإلزامي، لكن هناك حاجة قد تُلبّى. إشراكها في القرار يحفظ كرامتها ويبقي ثقتها بك — وهي قد تعود إليك لاحقاً بشيء أخطر. الوعد بالسرّية المطلقة يقيّدك، ونقل اسمها دون إذنها يعلّمها ألّا تثق بمتطوّع مرّة أخرى.',
            en: 'There is no danger here requiring mandatory reporting, but there is a need that could be met. Bringing her into the decision preserves her dignity and keeps her trust — and she may come back to you later with something graver. Promising absolute secrecy ties your hands, and passing on her name without her consent teaches her never to confide in a volunteer again.',
          },
        },
      ],
    },
  ],
};
