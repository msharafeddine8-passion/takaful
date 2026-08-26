import type { CourseContent } from './types';

/**
 * Level 4 — Negotiation and Community Advocacy. Pass mark 70.
 *
 * The core distinction the whole course turns on is the one between an
 * interest and a position. Everything else — preparing for a negotiation,
 * building an advocacy message, handling an objection, finding shared ground,
 * knowing when you are not entitled to speak — follows from that distinction.
 *
 * The section on community representation is the one that most training skips.
 * Well-intentioned volunteers routinely speak for people who did not ask them
 * to, and this causes two kinds of harm: decisions get made on the basis of
 * what the volunteer thinks rather than what the community said, and the
 * community's own capacity to speak for itself is quietly diminished each time
 * someone else does it first.
 */

export const negotiationAndAdvocacy: CourseContent = {
  slug: 'negotiation-and-advocacy',
  level: 4,
  minutes: 40,
  passMark: 70,
  title: {
    ar: 'التفاوض والمناصرة المجتمعية',
    en: 'Negotiation and Community Advocacy',
  },
  lede: {
    ar: 'الفرق بين المصلحة والموقف، وكيف تبني حجّة بالدليل، وكيف تناصر قضية من دون أن تتحدّث باسم أحد لم يفوّضك.',
    en: 'The difference between an interest and a position, how to build an argument on evidence, and how to advocate without speaking for people who did not ask you to.',
  },
  outcomes: {
    ar: [
      'تفصل المصالح عن المواقف المعلنة قبل التفاوض',
      'تبني رسالة مناصرة بالدليل وتوجّهها للجهة التي تملك القرار',
      'تدير اعتراضاً وتبحث عن حل يحقّق مصلحة مشتركة',
      'ترفض التحدّث باسم المجتمع من دون مشاركته',
    ],
    en: [
      'Separate interests from stated positions before negotiating',
      'Build an evidence-based advocacy message aimed at whoever holds the decision',
      'Handle an objection and look for a shared-interest outcome',
      'Refuse to speak for a community that has not been part of the conversation',
    ],
  },
  sources: [
    'Fisher, R., Ury, W. & Patton, B. — Getting to Yes: Negotiating Agreement Without Giving In (Penguin Books, 3rd ed.)',
    'UNHCR — Community-Based Protection: A Strategy for UNHCR Operations',
    'ICRC — Professional Standards for Protection Work in Conflict and Other Situations of Violence',
  ],

  modules: [
    // ---------------------------------------------------------------- 1
    {
      id: 'interests-positions',
      tag: { ar: 'الوحدة الأولى', en: 'Module 1' },
      title: {
        ar: 'المصلحة والموقف — الفرق الذي يصنع النتيجة',
        en: 'Interests and Positions — the distinction that shapes the outcome',
      },
      lede: {
        ar: 'خلف كل موقف صارم توجد مصلحة مشروعة. من يرى الموقف فقط يتفاوض على جدار؛ من يرى المصلحة يجد باباً.',
        en: 'Behind every hard position there is a legitimate interest. Whoever sees only the position negotiates against a wall; whoever sees the interest finds a door.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'حين يقول مدير الحيّ «لا يمكن أن تُقام الفعاليات في الساحة العامة»، ما الذي قاله فعلاً؟ قال موقفه — القرار النهائي الذي وصل إليه بعد تفكير أو خوف أو تجربة سابقة. لم يقل لماذا وصل إليه، ولم يقل ماذا يخشى أن يحدث لو قال نعم. ولو كنت قد جلست تفاوضه على موقفه مباشرةً، كنت ستجد نفسك أمام جدار: إما يتراجع وتنتصر أنت، أو يصمد ويبقى رأيه قائماً وتخسر أنت. هذه ليست مفاوضة — هذه مباراة يتفوّق فيها من يملك السلطة دائماً، وأنت في الغالب لست من يملكها.\n\nالمفاوضة الحقيقية تبدأ بسؤال واحد مختلف تماماً: لماذا؟ ليس تحدياً ولا استجواباً مقصوداً، بل فضولاً صادقاً نحو الشخص الذي تتحدّث معه. فضولاً يُشعره أنك مهتم بفهمه لا بالانتصار عليه. ربما يخشى الضجيج الذي يزعج سكاناً كباراً في العمر في البنايات المجاورة. ربما سبق أن وقع حادث لم يُعلن عنه رسمياً وبقيت تبعاته في ذاكرته. ربما يحتاج أن يبدو المكان منظّماً أمام جهة رقابية أعلى منه ستزوره الأسبوع القادم. هذه هي المصالح — الأسباب الحقيقية الكامنة خلف الموقف المعلن — وهي وحدها التي تفتح مساحة لإيجاد حلول لم تكن موجودة قبل أن تبدأ بالسؤال.',
            en: 'When a neighbourhood manager says "events cannot be held in the public square", what has he actually said? He has stated his position — the final decision he arrived at after reflection, fear, or a past experience. He has not said why he arrived at it, or what he fears would happen if he said yes. If you had sat down to negotiate against his position directly, you would have found a wall: either he backs down and you win, or he holds and you lose. That is not negotiation — it is a contest in which whoever holds the authority prevails, and you are usually not the one who does.\n\nReal negotiation begins with an entirely different question: why? Not as a challenge or a deliberate interrogation, but as genuine curiosity about the person you are speaking with — curiosity that signals you are interested in understanding him, not in winning over him. Perhaps he fears the noise will disturb elderly residents in the adjacent buildings. Perhaps there was an incident that was never officially reported, and its aftermath lives in his memory. Perhaps he needs the area to look orderly before an inspection from a superior body visiting next week. These are the interests — the real reasons underlying the stated position — and they alone open space for solutions that did not exist before you started asking.',
          },
        },
        {
          type: 'compare',
          yesTitle: { ar: 'المصلحة (السبب الحقيقي)', en: 'The interest (the real reason)' },
          noTitle: { ar: 'الموقف (ما يُقال)', en: 'The position (what is said)' },
          yes: {
            ar: [
              'القلق على سمعة الحيّ أمام المسؤولين والجهات الرقابية',
              'الخوف من سابقة تُعطي مجموعات أخرى نفس الحقّ بالاستخدام',
              'الحاجة إلى ضمان أو وثيقة يُبرّر بها قراره أمام رئيسه',
              'تجربة سابقة سيئة مع فعالية مشابهة أفضت إلى شكاوى',
              'عدم الرغبة في تحمّل المسؤولية القانونية لو وقع حادث ما',
            ],
            en: [
              'Concern about the neighbourhood\'s image before officials and oversight bodies',
              'Fear of a precedent granting other groups the same right to use the space',
              'Need for a guarantee or document to justify his decision to his superior',
              'A previous bad experience with a similar event that led to complaints',
              'Unwillingness to bear legal responsibility if something were to happen',
            ],
          },
          no: {
            ar: [
              '«لا يمكن إقامة الفعاليات هنا»',
              '«ليس لدينا إمكانية استيعاب هذا»',
              '«هذا ليس من صلاحياتنا»',
              '«التعليمات لا تسمح»',
              '«راجعوا الجهة المختصة»',
            ],
            en: [
              '"Events cannot be held here"',
              '"We don\'t have the capacity for this"',
              '"This is not within our authority"',
              '"The regulations don\'t allow it"',
              '"Contact the relevant authority"',
            ],
          },
        },
        {
          type: 'text',
          content: {
            ar: 'السؤال الأهمّ الذي يُميّز المفاوض المتمرّس من غيره ليس «كيف أقنعه؟» بل «ما الذي يهمّه فعلاً في هذا الموضوع؟» الأول يبحث عن حجّة، والثاني يبحث عن فهم. والفهم أقوى من أي حجّة لأنه يُتيح تصميم حلّ يجعل قبوله سهلاً ومريحاً لا مكلفاً ومحرجاً. الشخص الذي يرفضك ليس عدوّاً — هو إنسان لديه مخاوف واحتياجات ومسؤوليات لا تعرفها كلّها بعد. ومهمّتك قبل أي كلام إقناعي أن تعرفها.\n\nهذا التحوّل في السؤال هو بالضبط ما يجعل بعض المفاوضين يجدون حلولاً في مواقف يستسلم فيها الآخرون. ليس لأنهم أذكى أو أكثر خبرة بالضرورة، بل لأنهم يقضون وقتاً أطول في فهم الطرف الآخر وأقل وقتاً في الدفاع عن موقفهم. الموقف يمكن الدفاع عنه لاحقاً بعد أن تعرف ما الذي يخشاه الآخر وما الذي يريده، لكن لا يمكنك تصميم حلّ مناسب قبل أن تعرف ذلك.',
            en: 'The most important question that distinguishes the experienced negotiator is not "how do I convince them?" but "what actually matters to them in this?" The first seeks an argument; the second seeks understanding. And understanding is stronger than any argument because it allows you to design a solution that makes acceptance easy and comfortable rather than costly and embarrassing. The person who refuses you is not an enemy — they are a person with concerns, needs and responsibilities you do not yet fully know. And your task before any persuasive speech is to know them.\n\nThis shift in question is exactly what enables some negotiators to find solutions in situations where others give up. Not necessarily because they are smarter or more experienced, but because they spend more time understanding the other party and less time defending their own position. The position can be defended later once you know what the other person fears and wants, but you cannot design an appropriate solution before you know that.',
          },
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: 'كيف تكشف المصلحة دون أن تبدو متطفّلاً', en: 'How to uncover the interest without seeming intrusive' },
          content: {
            ar: 'اسأل بصيغة تُشعره أنك تحاول أن تفهم لا أن تجادل: «أريد أن أفهم أكثر — ما هو القلق الرئيسي الذي يجعلك تتحفّظ؟» أو «ماذا يكون الوضع المثالي بالنسبة لك لو أمكن ذلك؟» أو «إذا وجدنا طريقة تُعالج هذا القلق تحديداً، هل سيبقى هناك عائق آخر؟» هذه الأسئلة تفتح الحوار ولا تُغلقه، وتنقلك من مواجهة الموقف المُعلن إلى فهم الشخص الحقيقي الذي أمامك.',
            en: 'Ask in a way that signals you are trying to understand, not to argue: "I want to understand better — what is the main concern that makes you hesitate?" or "What would the ideal situation look like for you if it were possible?" or "If we found a way to address that particular concern, would there be another obstacle?" These questions open the conversation rather than closing it, and move you from confronting the stated position to understanding the real person in front of you.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'الفرق بين المصلحة والموقف ليس تفصيلاً أكاديمياً — إنه يقرّر ما إذا كنت ستجد حلاً أم لا. الموقف دائماً واحد: «لا». أما المصالح فمتعدّدة بتعدّد الناس، وكل مصلحة تفتح عليك طريقاً مختلفاً للحل. مدير الحيّ الذي يخشى «سابقة غير منضبطة» تستطيع إقناعه باتفاقية مكتوبة وموقّعة تُحدّد الشروط وتمنع التكرار التلقائي. والذي يخشى «الضوضاء والإزعاج» قد يقبل بتوقيت مختلف أو بمكان مُسوَّر. والذي يخشى «المسؤولية القانونية» يمكن أن تُعطيه وثيقة تتحمّل فيها جمعيتك المسؤولية الكاملة كتابياً وبتوقيع مُعتمد. لا حلّ من هذه الحلول ينفع لكل المواقف معاً، لكن كلاً منها يُصيب المصلحة الخاصة التي خلفه بدقة لا تُخطئ.',
            en: 'The difference between an interest and a position is not an academic detail — it determines whether you will find a solution at all. The position is always one thing: "No." The interests are multiple, as multiple as the people who hold them, and each interest opens a different path to a solution. The neighbourhood manager who fears "an uncontrolled precedent" can be satisfied with a written and signed agreement specifying the conditions and preventing automatic repetition. The one who fears "noise and disturbance" may accept a different time or an enclosed space. The one who fears "legal liability" can be given a document in which your organisation formally accepts full responsibility in writing with an authorised signature. None of these solutions works for every position at once, but each one hits the specific interest behind it with accuracy that never misses.',
          },
        },
        {
          type: 'quiz',
          id: 'na-q1',
          label: { ar: 'قرارك بالميدان', en: 'Your decision' },
          question: {
            ar: 'تطلب من بلدية استخدام مسرحها لعرض تربوي مجاني للأطفال. تقول البلدية: «المسرح محجوز للجهات الرسمية المرخّصة فقط». ما أفضل خطوة تالية؟',
            en: 'You request the use of a municipality\'s theatre for a free educational show for children. The municipality says: "The theatre is reserved for officially licensed bodies only." What is the best next step?',
          },
          options: [
            {
              ar: 'إخبارهم أن القرار يتعارض مع حقّ المجتمع في الوصول إلى مرفق ثقافي عام مموَّل من المال العام',
              en: 'Tell them the decision conflicts with the community\'s right to access a public cultural facility paid for from public money',
            },
            {
              ar: 'سؤالهم عمّا تعنيه «الجهات الرسمية» تحديداً وما القلق الذي تحميه هذه السياسة',
              en: 'Ask what "officially licensed bodies" means specifically and what concern this policy is protecting',
            },
            {
              ar: 'الاستسلام والبحث فوراً عن مكان بديل بدل إضاعة الوقت في مراجعات لن تُغيّر السياسة',
              en: 'Accept the refusal and look immediately for another venue rather than lose time on appeals that will not change the policy',
            },
            {
              ar: 'تصعيد الأمر مباشرةً إلى رئيس البلدية لأن الموظّف المسؤول لا يملك صلاحية الاستثناء',
              en: 'Escalate directly to the head of the municipality since the officer you spoke to has no authority to grant an exception',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'السؤال عن المعنى الدقيق وعن القلق الذي تحميه السياسة يكشف المصلحة خلف الموقف. «الجهات الرسمية» قد تعني أنهم يريدون ضماناً قانونياً من تنظيم مسجّل، أو أنهم يخشون سابقة يستغلها آخرون، أو أن المسرح يحتاج مسؤولاً موقّعاً أمام قانون المسرح. كل إجابة تفتح حلاً مختلفاً لم يكن ممكناً قبل السؤال. الاعتراض بحق الثقافة يحوّل الحوار إلى مواجهة ويُحرج المسؤول. والتصعيد الفوري يحرق جسراً قد تحتاجه بشدة لاحقاً.',
            en: 'Asking about the precise meaning and what concern the policy protects reveals the interest behind the position. "Officially licensed bodies" may mean they want legal security from a registered organisation, that they fear a precedent others will exploit, or that the theatre requires an accountable signatory under performing-arts regulations. Every answer opens a different solution that was not available before the question. Objecting on cultural-rights grounds turns the conversation into a confrontation and puts the official in an awkward position. Escalating immediately burns a bridge you may badly need later.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 2
    {
      id: 'negotiation-prep',
      tag: { ar: 'الوحدة الثانية', en: 'Module 2' },
      title: {
        ar: 'التحضير قبل الجلوس إلى الطاولة',
        en: 'Preparing before you sit at the table',
      },
      lede: {
        ar: 'المفاوض الذي يجلس غير مستعدّ لا يفاوض — يرتجل. والارتجال تحت الضغط يُنتج تنازلات لم تكن ضرورية يوماً.',
        en: 'A negotiator who sits down unprepared does not negotiate — they improvise. And improvising under pressure produces concessions that were never necessary.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'التحضير للتفاوض لا يعني كتابة قائمة بما تريده — يعني أن تعرف ثلاثة أشياء قبل أن تفتح فمك بأي كلمة. تعرف أولاً ما تريده في الحالة المثالية، وما تحتاجه فعلاً لكي يُنجز المشروع، وما أنت مستعدّ للتنازل عنه دون أن يتضرّر الهدف الجوهري. وتعرف ثانياً ما يريده الطرف الآخر وما يخشاه وما يحتاج أن يُبرّره أمام من هو أعلى منه. وتعرف ثالثاً وأهمّ من كل شيء: ما البديل الذي لديك إن انتهت المفاوضة بلا اتفاق، ومدى قوّة هذا البديل أو ضعفه.\n\nالمفاوض غير المستعدّ يقع في إحدى مشكلتين لا ثالث لهما: إما أنه يطلب أكثر ممّا يجرؤ على الدفاع عنه ويبدو لا واقعياً في عيون الآخر، أو أنه يتراجع سريعاً خوفاً من انهيار المحادثة فيُقدّم تنازلات كان بإمكانه الحفاظ عليها. وفي كلا الحالين السبب ذاته: لم يُفكّر مسبقاً بهدوء وبعيداً عن ضغط اللحظة في ما هو مستعدّ لقوله «نعم» له وما لن يقوله «نعم» له أبداً ومهما كانت الضغوط.',
            en: 'Preparing for a negotiation does not mean writing a list of what you want — it means knowing three things before you say any word. First, knowing what you want in the ideal case, what you actually need for the project to succeed, and what you are prepared to give up without damaging the core goal. Second, knowing what the other party wants and fears and what they need to be able to justify to whoever is above them. Third, and most importantly: knowing what alternative you have if the negotiation ends without agreement, and whether that alternative is strong or weak.\n\nAn unprepared negotiator falls into one of only two problems: either they ask for more than they dare defend and appear unrealistic in the other person\'s eyes, or they back down quickly for fear of the conversation collapsing and make concessions they could have kept. In both cases the reason is the same: they did not think calmly beforehand, away from the pressure of the moment, about what they are prepared to say yes to and what they will never say yes to no matter how much pressure there is.',
          },
        },
        {
          type: 'ordered',
          items: {
            ar: [
              'حدّد هدفك الأمثل: ما الذي سيكون نجاحاً كاملاً لا تنازل فيه؟',
              'حدّد حاجتك الجوهرية: الحدّ الأدنى الذي إن حصلت عليه يمكن للمشروع أن ينجح',
              'حدّد بديلك الأفضل (BATNA): ماذا تفعل تحديداً إن لم تتّفقا؟ وهل هو بديل جيّد أم سيئ؟',
              'فكّر في مصالح الطرف الآخر قبل اللقاء: ماذا يكسب فعلاً إن اتّفق معك؟',
              'توقّع اعتراضه الأقوى وجهّز ردّاً يعترف بالقلق لا يتجاهله',
              'تحقّق من هوية صاحب القرار الحقيقي: من تفاوض هل يستطيع القول «نعم»؟',
            ],
            en: [
              'Define your optimum goal: what would complete, uncompromised success look like?',
              'Define your core need: the minimum without which the project cannot succeed',
              'Define your best alternative (BATNA): what exactly do you do if no agreement is reached? And is it a good or a bad alternative?',
              'Think about the other party\'s interests before the meeting: what do they actually gain if they agree with you?',
              'Anticipate their strongest objection and prepare a response that acknowledges the concern rather than dismissing it',
              'Verify who actually holds the decision: can the person you are negotiating with say "yes"?',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'warn',
          title: { ar: 'خطّك الأدنى ليس للإعلان أمام أحد', en: 'Your minimum line is not for announcing to anyone' },
          content: {
            ar: 'معرفة خطّك الأدنى تُوجّه قراراتك من الداخل — لكنها لا تُقال للطرف الآخر مهما بدا الجوّ ودياً ومريحاً. من يعرف خطّك الأدنى يعرف بالضبط أين يتوقّف ولن يعطيك فلساً فوقه. المفاوضة تبدأ من هدفك الأمثل، تتحرّك نحو الأدنى تدريجياً وبمقابل حقيقي تحصل عليه في كل خطوة، وتتوقّف عند الأدنى وليس دونه أبداً.',
            en: 'Knowing your minimum line guides your decisions from the inside — but it is never told to the other party, however friendly and comfortable the atmosphere feels. Whoever knows your minimum knows exactly where to stop and will not give you a fraction above it. Negotiation starts from your optimum goal, moves toward the minimum gradually and in exchange for real gains at each step, and stops at the minimum rather than falling below it.',
          },
        },
        {
          type: 'grid',
          items: [
            {
              title: { ar: 'الهدف الأمثل', en: 'Optimum goal' },
              text: {
                ar: 'استخدام الساحة كل جمعة من الرابعة حتى الثامنة مساءً طوال الموسم مع صلاحية تركيب خيمة أو بسطة',
                en: 'Use of the square every Friday from 4 to 8 pm throughout the season with permission to erect a tent or stall',
              },
            },
            {
              title: { ar: 'الحاجة الجوهرية', en: 'Core need' },
              text: {
                ar: 'استخدام واحد شهرياً على الأقل بلا خيمة، مع إشعار مسبق بأسبوع وبشرط تنظيف المكان بعد كل استخدام',
                en: 'At least one use per month without a tent, with one week\'s advance notice and leaving the space clean after each use',
              },
            },
            {
              title: { ar: 'البديل الأفضل (BATNA)', en: 'Best alternative (BATNA)' },
              text: {
                ar: 'مبنى الجمعية المجاور بطاقة خمسين شخصاً — أصغر بكثير لكنه متاح دون قيود إضافية',
                en: 'The association\'s own adjacent building, capacity fifty — much smaller but available without additional restrictions',
              },
            },
          ],
        },
        {
          type: 'quiz',
          id: 'na-q2',
          label: { ar: 'قرارك بالميدان', en: 'Your decision' },
          question: {
            ar: 'في مفاوضة مع جهة ممولّة، قالت لك منذ البداية: «ميزانيتنا المرصودة لهذا البند لا تتجاوز خمسة آلاف دولار». ما الذي يخبرك هذا فعلاً؟',
            en: 'In a negotiation with a funding body, they tell you at the outset: "Our allocated budget for this item does not exceed five thousand dollars." What does this actually tell you?',
          },
          options: [
            {
              ar: 'إنه سقف فعلي مُقيَّد بقوانين الميزانية السنوية ولا يمكن تجاوزه مهما كان أثر المشروع، ولا فائدة من مناقشته',
              en: 'That it is a real ceiling constrained by annual budget regulations that cannot be exceeded whatever the project\'s impact, so discussing it is pointless',
            },
            {
              ar: 'أنهم أعلنوا خطّهم المفاوضي — الرقم الذي يريدون أن تقبله، لكنه ليس بالضرورة أقصى ما يمكنهم تقديمه',
              en: 'That they have stated their negotiating line — the number they want you to accept, but not necessarily the most they can offer',
            },
            {
              ar: 'أن المشروع غير مجدٍ بهذه الميزانية وعليك البحث عن جهة تمويل أخرى تقدّر حجمه الحقيقي',
              en: 'That the project is not viable on this budget and you should look for another funder who values its true scale',
            },
            {
              ar: 'يجب أن تطلب مبلغاً أقلّ فوراً لتُبدي مرونتك وتضمن ألّا ينسحبوا من تمويل المشروع',
              en: 'You should immediately ask for less to signal your flexibility and make sure they do not withdraw funding altogether',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'حين يُعلن طرف رقماً في بداية مفاوضة، فهو في الغالب يضع خطّه المفاوضي على الطاولة لا سقفه الحقيقي والنهائي. هذا لا يعني تجاهل الرقم أو طلب ضعفه، بل يعني استكشاف القيمة التي يُبرّر مبلغاً أعلى: ما الذي يمكنك أن تُقدّمه يجعل استثمارهم أكثر أثراً وأعمق قيمة؟ المفاوضة على القيمة والأثر لا على الأرقام وحدها هي ما تصل بك إلى ما هو فوق الخمسة آلاف دون أن يشعر الطرف الآخر أنه تراجع عن موقفه.',
            en: 'When a party states a number at the start of a negotiation, they are usually putting their negotiating line on the table, not their real and final ceiling. This does not mean ignoring the number or asking for twice it; it means exploring the value that would justify a higher amount: what can you offer that makes their investment more impactful and deeper in value? Negotiating on value and impact rather than numbers alone is what gets you above the five thousand without the other party feeling they have retreated from their position.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 3
    {
      id: 'advocacy-message',
      tag: { ar: 'الوحدة الثالثة', en: 'Module 3' },
      title: {
        ar: 'بناء رسالة المناصرة بالدليل',
        en: 'Building an advocacy message on evidence',
      },
      lede: {
        ar: 'الرأي يُردّ، والدليل يُناقَش. رسالة المناصرة التي لا تحمل رقماً أو حادثة موثّقة هي مجرّد رأي بصوت أعلى.',
        en: 'An opinion can be dismissed; evidence must be engaged. An advocacy message without a figure or a documented case is just an opinion said more loudly.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'المناصرة ليست احتجاجاً ولا طلب تعاطف عاطفي — هي جدال منطقي ومُقنع موجَّه إلى شخص بعينه يملك القرار الذي تحتاجه. ولكي يعمل الجدال ويُحدث أثراً حقيقياً، لا بدّ له من ثلاثة عناصر لا يمكن الاستغناء عن أيّ منها: مشكلة واضحة موثّقة بالأرقام والشواهد لا مجرد انطباعات، وصلة مباشرة بين هذه المشكلة وصلاحية أو موارد من تخاطبه تحديداً، وطلب واحد محدّد وقابل للتنفيذ يمكن الإجابة عنه بـ«نعم» أو «لا» دون التباس.\n\nالرسائل التي تفشل دائماً تتشارك صفة واحدة مشتركة من اثنتين: إما أنها تصف الألم والمشكلة بالتفصيل الكافي ولكنها لا تطلب شيئاً محدّداً قابلاً للتطبيق، أو أنها تطلب شيئاً محدّداً جيداً لكنها لا تُوضّح لماذا هذا الشخص بالذات — لا غيره — هو من يجب أن يفعله وبأيّ صفة وصلاحية. الرسالة القوية تجعل رفضها صعباً وغير مريح لأنها تُوضّح بجلاء ما يعنيه «لا» بالنسبة للشخص الذي يقولها ولصورته ولمسؤولياته.',
            en: 'Advocacy is neither a protest nor an emotional appeal for sympathy — it is a logical and persuasive argument directed at a specific person who holds the decision you need. For the argument to work and produce real effect, it needs three elements that cannot be dispensed with: a clear problem documented with numbers and examples rather than impressions, a direct connection between that problem and the authority or resources of the specific person you are addressing, and a single specific request that can be answered with "yes" or "no" without ambiguity.\n\nMessages that fail always share one of two common qualities: either they describe the pain and problem in sufficient detail but request nothing specific and actionable, or they request something specific and well-defined but do not explain why this particular person — not someone else — is the one who should do it and in what capacity. A strong message makes it difficult and uncomfortable to refuse because it makes plainly clear what "no" means for the person who says it, for their image, and for their responsibilities.',
          },
        },
        {
          type: 'ordered',
          items: {
            ar: [
              'ابدأ بجملة واحدة تُحدّد المشكلة ومن يتضرّر منها تحديداً',
              'قدّم رقماً أو دليلاً موثّقاً يجعل حجم المشكلة ملموساً لا مجرّد كلام',
              'اشرح لماذا هذا الشخص بالذات هو من يملك الصلاحية أو الموارد اللازمة للحلّ',
              'صِف الأثر الملموس المتوقّع على المتضرّرين إن اتُّخذ القرار المطلوب',
              'اختم بطلب واحد واضح ومحدّد زمنياً إن أمكن ذلك',
            ],
            en: [
              'Begin with one sentence identifying the problem and exactly who is harmed',
              'Provide a figure or documented evidence that makes the scale of the problem tangible rather than just words',
              'Explain why this specific person holds the authority or resources required for the solution',
              'Describe the concrete expected impact on those affected if the requested decision is made',
              'Close with a single clear request, time-specific if possible',
            ],
          },
        },
        {
          type: 'text',
          content: {
            ar: 'أكثر الأخطاء شيوعاً في رسائل المناصرة هو الخلط بين وصف المشكلة والمطالبة بحلّها. وصف المشكلة وحده يُنتج شعوراً بالأسف والتعاطف — وهو شعور لا يُفضي بالضرورة إلى قرار. المطالبة بحلّ بلا توصيف للمشكلة تبدو طلباً تعسّفياً. والجمع بينهما بالترتيب الصحيح — مشكلة موثّقة، ثم سبب انتماء هذا الشخص تحديداً للحلّ، ثم طلب واحد قابل للتنفيذ — هو ما يجعل المسؤول أمام خيار واضح لا خيار ضبابياً.\n\nوالوضوح في الطلب ليس تقليلاً من احترام المسؤول أو مصادرة لاجتهاده — بل هو مساعدة حقيقية له. المسؤول الذي يتلقّى طلباً غامضاً من نوع «افعل شيئاً بشأن هذا» لا يعرف أين يبدأ حتى لو أراد المساعدة. من يُحدّد له الطلب بدقة يُعطيه نقطة انطلاق، ومن يُوضّح له لماذا هو بالذات يُعطيه مبرّراً، ومن يُرفق دليلاً يُعطيه سلاحاً يستخدمه أمام من هو أعلى منه إن احتاج.',
            en: 'The most common error in advocacy messages is confusing describing the problem with demanding a solution. Description alone produces feelings of regret and sympathy — a feeling that does not necessarily lead to a decision. Demanding a solution without describing the problem appears arbitrary. Combining both in the correct order — a documented problem, then the reason why this specific person belongs to the solution, then one actionable request — is what places the official before a clear choice rather than a foggy one.\n\nClarity in the request is not disrespecting the official or pre-empting their judgment — it is genuine help. An official who receives a vague request of the "do something about this" variety does not know where to begin even if they want to help. Whoever specifies the request gives them a starting point; whoever explains why them specifically gives them a justification; whoever attaches evidence gives them a tool to use before their own superior if needed.',
          },
        },
        {
          type: 'compare',
          yesTitle: { ar: 'رسالة مناصرة فعّالة', en: 'Effective advocacy message' },
          noTitle: { ar: 'رسالة مناصرة ضعيفة', en: 'Weak advocacy message' },
          yes: {
            ar: [
              '«٧٢ طفلاً في الحيّ لا يجدون مكاناً آمناً للعب بعد المدرسة — استطلاعنا في مارس يُظهر هذا بوضوح»',
              '«الملعب البلدي القريب منهم مُغلق منذ سبعة أشهر بانتظار قرار ترميم»',
              '«إعادة فتحه إجراء وقائي يُقلّل حوادث الشارع — الشرطة سجّلت ثلاث حوادث مرورية بالقرب منه هذا الفصل»',
              '«نطلب إدراجه في مخصّصات الصيانة الطارئة لهذا الشهر — وهو ضمن صلاحياتك المباشرة»',
            ],
            en: [
              '"72 children in the neighbourhood have no safe place to play after school — our March survey shows this clearly"',
              '"The municipal playground near them has been closed for seven months awaiting a repair decision"',
              '"Reopening it is a preventive measure reducing street accidents — the police recorded three traffic incidents near it this term"',
              '"We ask for it to be included in this month\'s emergency maintenance allocation — which is within your direct authority"',
            ],
          },
          no: {
            ar: [
              '«الأطفال في حيّنا يعانون من غياب الفضاءات الترفيهية والمناطق الآمنة»',
              '«نأمل صادقين أن تولوا هذا الموضوع الاهتمام الذي يستحقه»',
              '«هذا الوضع يؤثّر سلباً على تنشئة الجيل القادم وعلى مستقبل الأمة»',
              '«نثق بحرصكم الدائم على مصلحة المجتمع ورعاية أبنائه»',
            ],
            en: [
              '"Children in our neighbourhood suffer from the lack of recreational spaces and safe areas"',
              '"We sincerely hope you will give this subject the attention it deserves"',
              '"This situation negatively affects the upbringing of the next generation and the future of the nation"',
              '"We trust in your constant concern for the community\'s wellbeing and the care of its children"',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: 'وجّه رسالتك لمن يملك القرار فعلاً لا لمن يتعاطف', en: 'Direct your message to whoever actually holds the decision, not to whoever sympathises' },
          content: {
            ar: 'كثير من رسائل المناصرة تصل إلى الشخص الخطأ — شخص يتعاطف بصدق مع القضية لكنه لا يملك السلطة ولا الميزانية ولا التوقيع اللازمين للتغيير. قبل أن ترسل أي رسالة اسأل: من هو الشخص الوحيد الذي يستطيع أن يقول «نعم» لهذا الطلب تحديداً؟ من يملك الميزانية أو القرار الإداري أو التوقيع الرسمي؟ الوصول إلى هذا الشخص حتى لو من خلال وسيط أو شفاعة أهمّ بكثير من صياغة الرسالة المثالية وإرسالها إلى الشخص الخطأ.',
            en: 'Many advocacy messages reach the wrong person — someone who genuinely sympathises with the cause but does not hold the authority, budget, or required signature to change anything. Before sending any message ask: who is the one person who can say "yes" to this specific request? Who holds the budget, the administrative decision, or the official signature? Reaching that person, even through an intermediary or a referral, matters far more than crafting the perfect message and sending it to the wrong person.',
          },
        },
        {
          type: 'quiz',
          id: 'na-q3',
          label: { ar: 'قرارك بالميدان', en: 'Your decision' },
          question: {
            ar: 'تكتب رسالة مناصرة لمدير صحّة المقاطعة تطلب فيها إضافة خدمة للصحة النفسية في مركز صحّي بمنطقة نازحين. أيّ افتتاحية تُعدّ أقوى وأكثر إقناعاً؟',
            en: 'You are writing an advocacy letter to the district health director requesting the addition of mental health services at a health centre in a displacement area. Which opening is stronger and more persuasive?',
          },
          options: [
            {
              ar: '«النازحون في منطقة X يعانون من ضغوط نفسية شديدة جراء تجاربهم المؤلمة وظروفهم المعيشية القاسية منذ نزوحهم»',
              en: '"Displaced people in area X suffer severe psychological stress because of their painful experiences and the harsh living conditions they have faced since displacement"',
            },
            {
              ar: '«مسح أجريناه على ٣٤٠ شخصاً في مركز X أظهر أن ٦٢٪ يُبلّغون عن أعراض قلق أو اكتئاب تؤثّر على وظائفهم اليومية — وليس في المركز حالياً أي بروتوكول إحالة للصحة النفسية»',
              en: '"A survey of 340 people at centre X found that 62% report anxiety or depression symptoms affecting their daily functioning — and the centre has no mental health referral protocol at present"',
            },
            {
              ar: '«نناشدك كمدير صحة أن تراعي المعاناة الإنسانية الكبيرة للنازحين في منطقتنا وتتّخذ الإجراء المناسب في أقرب فرصة»',
              en: '"We appeal to you as health director to take into account the great human suffering of displaced people in our area and take the appropriate action at the earliest opportunity"',
            },
            {
              ar: '«منظمات دولية عديدة كمنظمة الصحة العالمية والمفوضية السامية تؤكّد أن الصحة النفسية للنازحين أولوية في كل استجابة إنسانية»',
              en: '"Many international organisations such as WHO and UNHCR affirm that mental health for displaced people is a priority in every humanitarian response"',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'الجملة الثانية تحمل أربعة عناصر في جملة واحدة موجزة: رقم يُحدّد حجم العيّنة (٣٤٠ شخصاً)، ونسبة تُجسّد حجم المشكلة (٦٢٪)، وأثر ملموس في الحياة اليومية للمتضرّرين، وثغرة واضحة في النظام يملك المدير صلاحية سدّها. هذه المعطيات تضع المدير أمام مشكلة موثّقة تقع ضمن نطاق صلاحياته تحديداً لا أمام رأي عام يمكنه تجاهله ببساطة. الأمثلة الأخرى ليست خاطئة في جوهرها لكنها لا تُلزم أحداً بأي إجراء محدّد.',
            en: 'The second sentence carries four elements in one concise sentence: a number specifying the sample size (340 people), a proportion conveying the scale of the problem (62%), a concrete impact on the daily lives of those affected, and a clear gap in the system that the director has the authority to close. These facts place the director before a documented problem that falls specifically within his authority rather than before a general opinion he can simply set aside. The other examples are not wrong in substance but they bind nobody to any specific action.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 4
    {
      id: 'handling-objections',
      tag: { ar: 'الوحدة الرابعة', en: 'Module 4' },
      title: {
        ar: 'إدارة الاعتراض وإيجاد الأرضية المشتركة',
        en: 'Handling objections and finding common ground',
      },
      lede: {
        ar: 'الاعتراض ليس رفضاً — هو سؤال لم يُجَب عنه بعد. من يُجيب عليه بدفاعية يُحوّله رفضاً حقيقياً.',
        en: 'An objection is not a refusal — it is a question not yet answered. Whoever responds defensively turns it into a real one.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'حين يعترض شخص ما على مقترحك أو طلبك، ردّك الأول في اللحظة الأولى هو ما يقرّر مسار الحوار كلّه. إن قاطعته وأنت لا تزال تسمع نهاية جملته، أو دفعت بحجّة فورية قبل أن يُكمل، أرسلت رسالة لا تحمل كلمات: «لستُ مستعداً للاستماع إليك.» وحين يشعر الشخص أنه غير مسموع، لا يتغيّر رأيه — يتصلّب أكثر ويصير أشدّ تمسّكاً بموقفه حمايةً لكرامته لا قناعةً بحجّته. الخطوة الأولى في إدارة أي اعتراض ليست الردّ ولا الدفاع، بل الاستيعاب الحقيقي: دع الاعتراض يُكمل حتى آخر كلمة، أشعره أنك سمعت وفهمت ما قاله فعلاً، ثم اسأل سؤالاً واحداً يُوضّح لك ما وراء الاعتراض وما العمق الحقيقي فيه.',
            en: 'When someone objects to your proposal or request, your very first response in the very first moment determines the course of the entire conversation. If you interrupt while you are still hearing the end of their sentence, or push back with an immediate argument before they have finished, you send a wordless message: "I am not ready to listen to you." And when a person feels unheard, their opinion does not change — it hardens further and they cling more strongly to their position, not from conviction in their argument but in protection of their dignity. The first step in handling any objection is not response or defence, but genuine reception: let the objection finish to its last word, signal that you actually heard and understood what was said, then ask a single question that clarifies what lies beneath the objection and its real depth.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'الاعتراض دائماً أحد ثلاثة أشياء متمايزة، ولكلٍّ منها طريقة مختلفة تماماً في التعامل: معلومة ناقصة عند الطرف الآخر يمكنك تقديمها بلطف ووضوح، أو مخاوف حقيقية لم تُعالَج في مقترحك يمكنك الاستجابة لها وتعديل المقترح، أو اختلاف في القيم والأولويات يحتاج إلى إيجاد أرضية مشتركة عميقة. الخلط بين هذه الأنواع الثلاثة هو ما يُفشل معظم الحوارات والمفاوضات: حين تُقدّم معلومة تصحيحية لمن يعاني في الحقيقة من مخاوف لم تُعالَج، تبدو وكأنك تُكذّبه لا تُساعده. وحين تُحاول معالجة مخاوف من يختلف معك في القيم الجوهرية فأنت تُجيب على السؤال الخطأ وتضيّع الوقت والجهد. تمييز نوع الاعتراض قبل الردّ عليه يوفّر عليك محاولات كثيرة فاشلة وكلاماً كثيراً لم يُجدِ.',
            en: 'An objection is always one of three distinct things, and each requires an entirely different approach: missing information the other party lacks that you can offer gently and clearly; real concerns that your proposal did not address that you can respond to and adjust; or a difference in values and priorities that requires finding deep common ground. Confusing these three types is what causes most conversations and negotiations to fail: when you offer correcting information to someone who in reality has unaddressed concerns, you seem to be contradicting them rather than helping. And when you try to address the concerns of someone whose core values differ from yours, you are answering the wrong question and wasting time and effort. Distinguishing the type of objection before responding saves you many failed attempts and much futile speech.',
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'دع الاعتراض يُكمل حتى آخره — لا تقاطع حتى لو كنت تعرف الردّ تماماً',
              'أشعره أنك سمعت: «أفهم تماماً قلقك في هذه النقطة بالذات...»',
              'اسأل سؤالاً توضيحياً قبل الردّ: «حتى أُجيبك على نحو مفيد — ما الذي يُقلقك تحديداً في هذا؟»',
              'إن كان الاعتراض معلوماتياً: قدّم الحقيقة بلطف لا باستعلاء أو تصحيح',
              'إن كان الاعتراض مخاوف: اعترف بها أولاً ثم اقترح كيف يمكن معالجتها',
              'إن كان الاعتراض قيمياً: ابحث عن الهدف المشترك العميق خلف الاختلاف الظاهر',
              'لا تتنازل عن مبدأ جوهري لمجرد الضغط الاجتماعي أو الرغبة في الانتهاء — التنازل السريع يُفقدك المصداقية ويُشجّع على مزيد من الاعتراضات',
            ],
            en: [
              'Let the objection finish entirely — do not interrupt even if you know exactly what the response is',
              'Signal that you heard: "I fully understand your concern on this particular point..."',
              'Ask a clarifying question before responding: "So I can answer usefully — what specifically concerns you about this?"',
              'If the objection is informational: offer the truth gently, not from superiority or correction',
              'If the objection is a concern: acknowledge it first, then suggest how it can be addressed',
              'If the objection is about values: look for the deep shared goal beneath the visible difference',
              'Do not give up a core principle under social pressure or the desire to finish — quick concession loses you credibility and encourages further objections',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: 'الأرضية المشتركة ليست نصف الطريق', en: 'Common ground is not splitting the difference' },
          content: {
            ar: 'الأرضية المشتركة لا تعني أن كل طرف يحصل على نصف ما يريد — هذه مساومة حسابية لا تفاوضاً حقيقياً. الأرضية المشتركة تعني إيجاد حلّ يُعالج المصلحة الجوهرية لكل طرف حتى لو بدا هذا الحلّ مختلفاً تماماً عن المقترح الأصلي لأيّ منهما. حين يريد أحدهم «ألا تُقام الفعالية» لأنه يخشى الضوضاء، والحلّ هو تغيير الوقت — لا إلغاء الفعالية ولا التحمّل الصامت — هذا هو الإبداع في التفاوض.',
            en: 'Common ground does not mean each party gets half of what they want — that is arithmetic compromise, not real negotiation. Common ground means finding a solution that addresses the core interest of each party even if that solution looks entirely different from either party\'s original proposal. When someone wants "the event not to happen" because they fear noise, and the solution is changing the time — not cancelling the event and not silent endurance — that is the creativity of negotiation.',
          },
        },
        {
          type: 'quiz',
          id: 'na-q4',
          label: { ar: 'سيناريو التفاوض', en: 'Negotiation scenario' },
          question: {
            ar: 'تطلب إذناً لإقامة ورشة توعية صحية في مبنى حكومي. مدير المبنى يعترض: «لا نريد أن يرى المراجعون أناساً من خارج المؤسسة يدخلون من بوابة الموظّفين الرسمية.» ما ردّك الأفضل؟',
            en: 'You ask permission to hold a health awareness workshop in a government building. The building manager objects: "We do not want the public to see outsiders entering through the official staff gate." What is your best response?',
          },
          options: [
            {
              ar: '«هذا البناء ملك عام ممولّ من ضرائب الناس وأنتم ملزمون قانوناً بإتاحته لخدمة المجتمع الذي يموّله»',
              en: '"This is a public building funded by people\'s taxes and you are legally obliged to make it available to serve the community that pays for it"',
            },
            {
              ar: '«أفهم قلقك على هيبة المكان ونظامه. هل يُحلّ الأمر باستخدام مدخل آخر أو بوقت بعد انتهاء الدوام الرسمي؟»',
              en: '"I understand your concern about the building\'s dignity and order. Would using a different entrance or scheduling it after official working hours solve this?"',
            },
            {
              ar: '«سنضمن أن كل مشارك يُعرِّف بنفسه عند الباب ويحمل بطاقة زائر ويلتزم بكل بروتوكولات المبنى والأمن من دون استثناء»',
              en: '"We will guarantee that every participant identifies themselves at the door, wears a visitor badge, and complies with every building and security protocol without exception"',
            },
            {
              ar: '«إن لم توافقوا سنجد مبنى آخر وسنذكر في تقاريرنا أن الدائرة رفضت التعاون مع برنامج مجتمعي»',
              en: '"If you do not agree we will find another building, and we will note in our reports that the department refused to cooperate with a community programme"',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'الردّ الثاني يُجري ثلاثة أشياء في جملة واحدة: يستوعب القلق باحترام ولا يتجاهله أو يُعارضه، يُترجم الموقف إلى مصلحة حقيقية (هيبة المكان ونظامه)، ويسأل إن كان بديل بسيط يُعالج هذه المصلحة بالكامل. القلق الحقيقي للمدير ليس «البوابة» بحدّ ذاتها — هو الصورة أمام المراجعين. مدخل جانبي أو توقيت بعد انتهاء الدوام قد يُعالج هذا القلق بالكامل دون أي تكلفة. الردّ الأول استفزازي ويجعله يتمسّك بموقفه دفاعاً عن كرامته. والثالث وعد فارغ. والرابع يُعلن الاستعداد للمغادرة ويُسقط كل نفوذ.',
            en: 'The second response does three things in one sentence: it acknowledges the concern respectfully without dismissing or opposing it, translates the position into a real interest (the building\'s dignity and order), and asks whether a simple alternative addresses this interest entirely. The manager\'s real concern is not "the gate" as such — it is the image before the public. A side entrance or a time after working hours may address this concern completely at no cost. The first response is provocative and makes him cling to his position in defence of his dignity. The third is an empty promise. The fourth signals readiness to leave and surrenders all leverage.',
          },
        },
        {
          type: 'quiz',
          id: 'na-q5',
          label: { ar: 'تحقّق من فهمك', en: 'Check your understanding' },
          question: {
            ar: 'في جلسة تفاوض، يقول الطرف الآخر: «هذا المشروع لا يناسب أولويات منطقتنا في هذه المرحلة». أيّ نوع من الاعتراضات هذا؟',
            en: 'In a negotiation session, the other party says: "This project does not match our area\'s priorities at this stage." What type of objection is this?',
          },
          options: [
            {
              ar: 'اعتراض معلوماتي — لديهم معلومات ناقصة عن المشروع يكفي تصحيحها بعرض تفصيلي عن أهدافه',
              en: 'An informational objection — they have incomplete information about the project that a detailed presentation of its aims would correct',
            },
            {
              ar: 'قد يكون اعتراض مخاوف أو قيمي — يحتاج سؤالاً توضيحياً قبل الحكم عليه وتحديد نوعه',
              en: 'Likely a concerns or values objection — it needs a clarifying question before judging it or identifying its type',
            },
            {
              ar: 'اعتراض قيمي نهائي لا يمكن التفاوض عليه — أولوياتهم مختلفة عن أولوياتك ولا يبقى إلا البحث عن شريك آخر',
              en: 'A final values objection that cannot be negotiated — their priorities differ from yours and all that remains is to look for another partner',
            },
            {
              ar: 'ليس اعتراضاً حقيقياً بل ذريعة مهذّبة للرفض، والأفضل تجاوزها ومواصلة عرض مزايا المشروع',
              en: 'Not a real objection but a polite pretext for refusal, so the best move is to pass over it and carry on presenting the project\'s merits',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'جملة «لا يناسب أولوياتنا» يمكن أن تعني أشياء مختلفة تماماً: ربما لا يعرفون أن المشروع يخدم أولوية موجودة لديهم فعلاً (معلوماتي)، أو يخشون تكلفته على ميزانيتهم (مخاوف)، أو يختلفون فعلاً في الأولويات (قيمي). الحكم على نوع الاعتراض قبل السؤال عنه خطأ كلاسيكي. السؤال الأمثل هنا: «ما الأولويات التي تعملون عليها هذه المرحلة؟» — إجابته تُحدّد نوع الاعتراض وتفتح مسار الحلّ الصحيح.',
            en: '"Does not match our priorities" can mean entirely different things: perhaps they do not know the project actually serves a priority they already have (informational), or they fear its cost to their budget (concerns), or they genuinely differ in priorities (values). Judging the type of objection before asking about it is a classic mistake. The ideal question here is: "What priorities are you working on in this phase?" — the answer identifies the type of objection and opens the correct path to a solution.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 5
    {
      id: 'community-representation',
      tag: { ar: 'الوحدة الخامسة', en: 'Module 5' },
      title: {
        ar: 'حدود تمثيل المجتمع — متى لا تتحدّث باسمه',
        en: 'Limits of community representation — when not to speak in its name',
      },
      lede: {
        ar: 'المناصرة الأكثر ضرراً هي التي تُصوَّر على أنها مساعدة: التحدّث باسم مجتمع لم يُفوّضك ولم يطلب منك ذلك.',
        en: 'The most harmful advocacy is the kind dressed as help: speaking for a community that has not authorised you and did not ask you to.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'حين تقف أمام مسؤول أو جهة ممولّة وتقول «المجتمع يريد...» أو «الناس في هذه المنطقة يطالبون بـ...» أو «أتحدّث باسم الأسر المتضرّرة...» — تفعل أحد شيئين لا ثالث لهما: إما أنك تنقل رأياً وموقفاً حصلت عليه عبر عملية مشاركة حقيقية وموثّقة، أو أنك تنقل تصوّرك الشخصي وحدسك وتفسيرك الخاص لما يريده الناس. الفرق بين الاثنين ليس أخلاقياً وجدانياً فقط — هو مهني ومنهجي في المقام الأول، وله عواقب مباشرة وملموسة على الأرض.\n\nالمجتمعات ليست كتلة متجانسة صماء ذات صوت واحد. الأشخاص الذين تعرفهم وتلتقي بهم باستمرار ليسوا كل المجتمع. والأصوات الأعلى فيه والأكثر حضوراً ليست بالضرورة الأوسع تمثيلاً للصامتين والغائبين والمُقصَين. والاحتياج الذي تراه بوضوح وتشعر بإلحاحيته قد يكون احتياجاً حقيقياً موجوداً فعلاً، لكنه ليس بالضرورة أولوية من يُفترض أنك تمثّله ويتحدّث باسمه. حين تتحدّث باسم من لم يطلبوا منك ذلك صراحة، فأنت لا تساعدهم فعلاً — أنت تُقلّل من قدرتهم وصلاحيتهم على التحدّث عن أنفسهم لأنفسهم، وتُرسّخ نمطاً خطيراً يقول إن أصواتهم تحتاج وسيطاً لكي تُسمع.',
            en: 'When you stand before an official or a funding body and say "the community wants..." or "people in this area are demanding..." or "I am speaking on behalf of the affected families..." — you are doing one of only two things: either reporting a view and position you obtained through a genuine and documented participation process, or conveying your personal perception, instinct and interpretation of what people want. The difference between the two is not only an emotional or ethical matter — it is professional and methodological first of all, and has direct and tangible consequences on the ground.\n\nCommunities are not a homogeneous, solid block with a single voice. The people you know and meet regularly are not the whole community. And the loudest, most visible voices within it are not necessarily the most representative of the silent, absent and excluded. The need you see clearly and feel urgently may be a real and genuine need, but it is not necessarily a priority for those you are supposed to represent. When you speak for people who have not explicitly asked you to, you are not actually helping them — you are reducing their capacity and authority to speak about themselves for themselves, and you are entrenching a dangerous pattern that says their voices need an intermediary to be heard.',
          },
        },
        {
          type: 'ordered',
          items: {
            ar: [
              'اسأل صراحةً قبل أن تُمثّل: «هل تريدون منّا رفع هذا الطلب باسمكم؟»',
              'وثّق المشاركة بشكل يمكن الإشارة إليه: جلسة مع محضر، أو استطلاع، أو اتفاقية مكتوبة',
              'اذكر بدقة من شارك ومن لم يشارك: «٣٢ شخصاً من المنطقة الشمالية شاركوا في جلسة يناير»',
              'لا تُعمّم على من لم تلتقِ بهم: «من التقينا بهم أشاروا إلى...» أدقّ بكثير من «المجتمع يريد...»',
              'أعطِ المجتمع نسخة من رسالتك أو موقفك قبل إيصاله لأي جهة — هذا ضمان للحقيقة',
              'إن خالفك شخص من المجتمع في ما نسبته إليه، استمع إليه أولاً واحتمل أنك أخطأت',
            ],
            en: [
              'Ask explicitly before representing: "Would you like us to raise this request in your name?"',
              'Document the participation in a way that can be pointed to: a session with minutes, a survey, or a written agreement',
              'State precisely who participated and who did not: "32 people from the northern district attended the January session"',
              'Do not generalise to those you have not met: "Those we met indicated..." is far more accurate than "the community wants..."',
              'Give the community a copy of your message or position before delivering it to any body — this is a guarantee of accuracy',
              'If someone from the community contradicts what you attributed to them, listen first and allow that you may have been wrong',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'stop',
          title: { ar: 'التمثيل غير المُفوَّض يُضرّ أكثر مما ينفع دائماً', en: 'Unauthorised representation always harms more than it helps' },
          content: {
            ar: 'حين يتحدّث أحدهم باسم مجتمع بلا تفويض ويُخطئ في تمثيل أولوياته أو احتياجاته، يحدث ضرر مزدوج: القرار الذي يُتّخذ لا يُعالج الحاجة الحقيقية لأنه بُني على تصوّر مُتكلّم واحد، والمجتمع يخسر مصداقيته أمام هذا المسؤول في المرة القادمة. وحين يكتشف المجتمع أن أحداً تحدّث باسمه بلا إذنه — حتى لو كان صادقاً في نيته وصائباً في جوهر ما قاله — يفقد ثقته بهذا الشخص، وهذه الثقة هي رأسمالك الوحيد الحقيقي في أي عمل مجتمعي على المدى البعيد.',
            en: 'When someone speaks for a community without authorisation and misrepresents its priorities or needs, double damage occurs: the decision made does not address the real need because it was built on one speaker\'s perception, and the community loses credibility with that official for the next time. And when a community discovers that someone spoke in its name without permission — even if they were sincere in intent and correct in the substance of what they said — it loses trust in that person, and that trust is your only real capital in any community work over the long term.',
          },
        },
        {
          type: 'compare',
          yesTitle: { ar: 'تمثيل مسؤول وموثّق', en: 'Responsible and documented representation' },
          noTitle: { ar: 'تمثيل مُفترَض وغير مُفوَّض', en: 'Assumed and unauthorised representation' },
          yes: {
            ar: [
              '«٤٥ من سكّان الحيّ أجرينا معهم مقابلات فردية وأفادوا بأن أولويتهم الأولى هي...»',
              '«اتّفقنا مع لجنة الأهالي المنتخبة على رفع هذا المطلب نيابةً عنهم»',
              '«وزّعنا الملخّص على المشاركين وحصلنا على موافقتهم الصريحة قبل اجتماع اليوم»',
              '«هذا يعكس رأي ثلاثة أحياء من أصل خمسة — الحيّان الآخران لم نتمكّن من التواصل معهما»',
            ],
            en: [
              '"We conducted individual interviews with 45 neighbourhood residents who indicated their first priority is..."',
              '"We agreed with the elected parents\' committee to raise this demand on their behalf"',
              '"We circulated the summary to participants and received their explicit approval before today\'s meeting"',
              '"This reflects the view of three out of five districts — we were unable to reach the other two"',
            ],
          },
          no: {
            ar: [
              '«المجتمع في هذه المنطقة يريد...»',
              '«الناس هنا يرفضون هذا المشروع رفضاً قاطعاً»',
              '«أتحدّث باسم الأسر المتضرّرة» (دون أي تفويض موثّق)',
              '«الجميع يتّفق أن الأولوية هي...»',
            ],
            en: [
              '"The community in this area wants..."',
              '"People here categorically reject this project"',
              '"I am speaking on behalf of the affected families" (without any documented mandate)',
              '"Everyone agrees that the priority is..."',
            ],
          },
        },
        {
          type: 'quiz',
          id: 'na-q6',
          label: { ar: 'قرارك بالميدان', en: 'Your decision' },
          question: {
            ar: 'دُعيتِ للحديث في اجتماع بلدي عن احتياجات اللاجئين في منطقة عملك. أجريتِ محادثات غير رسمية مع عشرين أسرة على مدى ثلاثة أسابيع. كيف تُقدّمين نفسك وما ستقولينه؟',
            en: 'You have been invited to speak at a municipal meeting about refugee needs in your work area. You have had informal conversations with twenty families over three weeks. How do you introduce yourself and what you will say?',
          },
          options: [
            {
              ar: '«أنا ممثّلة اللاجئين في هذه المنطقة وأتحدّث نيابةً عنهم جميعاً، وسأعرض الأولويات التي خلصتُ إليها بوصفها الأكثر إلحاحاً لهم حتى يخرج المجلس اليوم بقائمة واحدة واضحة»',
              en: '"I represent the refugees in this area and speak on behalf of all of them, and I will set out the priorities I have concluded are the most urgent for them so the council leaves today with one clear list"',
            },
            {
              ar: '«تحدّثتُ مع عشرين أسرة خلال الأسابيع الثلاثة الماضية وما يلي يعكس ما سمعته منهم — وأودّ التأكيد أن أصواتهم المباشرة أهمّ وأولى من أي وسيط»',
              en: '"I spoke with twenty families over the past three weeks and what follows reflects what I heard from them — and I want to emphasise that their direct voices matter more than any intermediary"',
            },
            {
              ar: '«أنا متطوّعة أمضيتُ ثلاث سنوات في العمل الميداني في هذه المنطقة وأعرف احتياجات الناس هنا أفضل من أي تقرير مكتوب»',
              en: '"I am a volunteer who has spent three years working in the field in this area, and I know what people here need better than any written report does"',
            },
            {
              ar: '«معظم اللاجئين الذين التقيتُ بهم يطالبون بـ... وهذا ما ستسمعونه من أي أسرة تسألونها في المنطقة»',
              en: '"Most of the refugees I met are demanding... and this is what you would hear from any family you asked in the area"',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'الجواب الثاني يفعل شيئين ضروريين في آن واحد: يُحدّد بدقة حجم العيّنة وطبيعة التواصل (عشرون أسرة في ثلاثة أسابيع من محادثات غير رسمية)، ويُشير بوضوح إلى حدود تمثيله ويدعو إلى سماع الأصوات المباشرة. هذا الوضوح لا يُضعف موقفك أمام الاجتماع — بل يجعله أكثر مصداقية وأكثر صدقاً. «ممثّلة اللاجئين» لقب لم يمنحك إياه أحد. «لديّ خبرة وأعرف» يُحوّل تجربتك الشخصية إلى حقيقة موضوعية وهي ليست كذلك بالضرورة. «معظم» مبالغة لعشرين لقاءً غير رسمياً.',
            en: 'The second answer does two necessary things simultaneously: it specifies precisely the sample size and nature of contact (twenty families over three weeks of informal conversations), and it clearly states the limits of its representation and invites direct voices to be heard. This clarity does not weaken your position before the meeting — it makes it more credible and more honest. "Refugee representative" is a title nobody gave you. "I have experience and I know" turns your personal experience into objective truth, which it is not necessarily. "Most" is an exaggeration for twenty informal conversations.',
          },
        },
      ],
    },
  ],
};
