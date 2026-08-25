import type { CourseContent } from './types';

/**
 * Level 2 — First Aid Principles. Pass mark 80.
 *
 * This is an awareness course, not a skills course. It teaches a volunteer
 * what to look at before approaching a casualty, how to structure an
 * emergency call, what they must not do while waiting for trained help,
 * and why this course is not a substitute for certified hands-on training.
 *
 * The hardest thing to teach is restraint. Most harm done by untrained
 * bystanders comes from action rather than inaction — moving someone with a
 * suspected spinal injury, pulling out an embedded object, giving water to an
 * unconscious person. So the course spends as much time on the "do not" list
 * as on the "do" list, and explains the reason behind every prohibition rather
 * than just stating it.
 */

export const firstAidBasics: CourseContent = {
  slug: 'first-aid-basics',
  level: 2,
  minutes: 30,
  passMark: 80,
  title: {
    ar: 'مبادئ الإسعافات الأولية',
    en: 'First Aid Principles',
  },
  lede: {
    ar: 'دورة توعوية: كيف تُؤمّن المكان، وكيف تطلب المساعدة، وما الذي يجب ألّا تفعله. لا تجعلك مسعفاً، ولا تُغني عن تدريب عملي معتمد.',
    en: 'An awareness course: how to make a scene safe, how to call for help, and what you must not do. It does not make you a first aider and does not replace certified hands-on training.',
  },
  outcomes: {
    ar: [
      'تُقيّم سلامة المكان قبل الاقتراب من مصاب',
      'تطلب خدمات الطوارئ وتعطيها المعلومات التي تحتاجها بالترتيب',
      'تتعرّف على ما يجب ألّا تفعله حتى وصول المختص',
      'تشرح لماذا لا تُغني هذه الدورة عن تدريب عملي معتمد',
    ],
    en: [
      'Assess whether a scene is safe before approaching an injured person',
      'Call emergency services and give them what they need, in order',
      'Recognise what you must not do until a trained responder arrives',
      'Explain why this course is not a substitute for certified hands-on training',
    ],
  },
  sources: [
    'IFRC — International First Aid, Resuscitation, and Education Guidelines (2020)',
    'World Health Organization — Emergency Care and Trauma Guidance',
    'ICRC — First Aid in Armed Conflict and Other Situations of Violence',
  ],

  modules: [
    // ---------------------------------------------------------------- 1
    {
      id: 'scene-safety',
      tag: { ar: 'الوحدة الأولى', en: 'Module 1' },
      title: { ar: 'تقييم سلامة المكان قبل الاقتراب', en: 'Assessing scene safety before approaching' },
      lede: {
        ar: 'قبل أن تقترب من مصاب، توقّف لعشر ثوانٍ واسأل: هل هذا المكان آمن لي أن أقترب منه الآن؟',
        en: 'Before you approach an injured person, pause for ten seconds and ask: is it safe for me to approach this scene right now?',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'الغريزة الطبيعية عند رؤية شخص مصاب أو ساقط هي الاندفاع إليه فوراً. هذه الغريزة إنسانية تماماً ولا ينبغي أن نُخجل منها، ولكنها تحتاج إلى لحظة توقّف واحدة قبل التصرّف. أول مبدأ يتعلّمه كلّ مسعف في أول يوم من تدريبه الاحترافي هو هذا: الموقع غير الآمن لا يستوعب منقذاً إضافياً — يستوعب ضحية إضافية. فريق الطوارئ الذي يصل إلى حادث ويجد بجانب المصاب الأصلي متطوّعاً أُصيب وهو يحاول المساعدة لديه الآن مشكلتان بدل مشكلة واحدة، ومواردُه ذاتها بلا زيادة. قبل أن تتحرّك خطوة واحدة نحو المصاب، توقّف للحظة وانظر: ما الذي أصاب هذا الشخص؟ وهل ما أصابه لا يزال موجوداً ويمكن أن يصيبك أنت؟ هذا السؤال الواحد يكفي لإنقاذ حياتين بدل حياة واحدة.',
            en: 'The natural instinct when you see someone injured or fallen is to rush straight to them. That instinct is entirely human and nothing to be ashamed of, but it needs one moment of pause before acting. The first principle every professional responder learns on their first day of training is this: an unsafe scene does not absorb an additional rescuer — it absorbs an additional casualty. An emergency team that arrives to find a volunteer injured alongside the original casualty now has two problems with the same resources. Before you take a single step toward the injured person, stop for a moment and look: what happened to this person? And is whatever happened to them still present and able to happen to you?',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'تقييم سلامة المكان لا يعني التردّد أو الوقوف مكتوف الأيدي — يعني النظر السريع في عشر ثوانٍ. انظر إلى ما حولك بترتيب: هل الأرض ثابتة أم هناك خطر انهيار أو انزلاق؟ هل هناك دخان أو رائحة غريبة تدلّ على غاز أو مواد كيميائية؟ هل ثمّة مركبة لا تزال متحرّكة أو حركة مرور لم تتوقّف؟ هل هناك خطر كهربائي مرئي أو أسلاك مكشوفة على الأرض؟ هل الوضع الأمني حول الحادث مستقرّ؟ هذه الأسئلة الخمسة تأخذ عشر ثوانٍ وتحميك من الانزلاق من شاهد قادر على المساعدة إلى ضحية ثانية تزيد من عبء الطوارئ.',
            en: 'Assessing scene safety does not mean hesitating or standing idle — it means a quick scan in ten seconds. Look around you in order: is the ground stable or is there a risk of collapse or slipping? Is there smoke or a strange smell indicating gas or chemicals? Is there a vehicle still moving or traffic that has not stopped? Is there visible electrical danger or exposed cables on the ground? Is the security situation around the incident stable? These five questions take ten seconds and protect you from sliding from a capable witness into a second casualty who adds to the emergency burden.',
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'الحريق النشط أو الدخان الكثيف: لا تدخل مبنىً أو مركبة تحترق — الدخان وحده يُفقد الوعي في ثوانٍ',
              'الكهرباء المكشوفة: لا تقترب من شخص يلمس سلكاً أو عموداً كهربائياً — الكهرباء تنتقل عبر التربة في نطاق واسع',
              'حوادث المرور: تأكّد من توقّف حركة السيارات قبل الدخول إلى الطريق — معظم المصابين الثانيين في الحوادث وصلوا لمساعدة الأوّل',
              'السقوط والانهيار: لا تقف تحت جدار مائل أو بالقرب من منشأة مشقوقة قد تستمر في الانهيار',
              'المواد الكيميائية أو السوائل غير المعروفة: إن شممت رائحة غريبة أو رأيت سوائل مسكوبة ذات لون غير عادي، ابتعد وأبلغ الطوارئ',
              'حالات العنف النشط: إن كان هناك شجار مستمر أو تهديد جسدي واضح، لا تتدخّل جسدياً — أمنك شرط لمساعدة أي شخص آخر',
            ],
            en: [
              'Active fire or thick smoke: do not enter a burning building or vehicle — smoke alone causes loss of consciousness within seconds',
              'Exposed electricity: do not approach anyone touching a live cable or damaged pole — electricity travels through the ground over a wide radius',
              'Traffic accidents: confirm that vehicles have stopped before entering the road — most secondary casualties arrive trying to help the first',
              'Collapse or structural failure: do not stand beneath a leaning wall or near a structure that may continue to fall',
              'Chemical or unknown spills: if you smell something strange or see liquids of an unusual colour, move away and tell the emergency services',
              'Active violence: if there is an ongoing fight or clear physical threat, do not intervene physically — your safety is a condition for helping anyone else',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'warn',
          title: { ar: 'البقاء بعيداً قرار، لا تقصير', en: 'Staying back is a decision, not a failure' },
          content: {
            ar: 'حين لا يكون المكان آمناً، أكثر ما يمكنك فعله هو البقاء على مسافة آمنة وإعطاء خدمات الطوارئ وصفاً دقيقاً لما تراه. المسعفون مدرّبون على الدخول إلى أماكن لم تُدرَّب أنت عليها قطّ، ولديهم معدّات عزل ووقاية وبروتوكولات دخول آمن لا تملكها. وصفك الدقيق لهم من مسافة آمنة — موقع المصاب، وضعه، الخطر القائم — هو مساهمة حقيقية وليست تخلياً.',
            en: 'When a scene is not safe, the most you can do is stay at a safe distance and give the emergency services an accurate description of what you see. Paramedics are trained to enter places you have never been trained for, and they carry isolation equipment, protective gear, and safe-entry protocols you do not have. Your accurate description from a safe distance — where the casualty is, their condition, what the hazard is — is a real contribution, not an abdication.',
          },
        },
        {
          type: 'quiz',
          id: 'fab-q1',
          label: { ar: 'قرارك', en: 'Your decision' },
          question: {
            ar: 'رأيت رجلاً سقط قرب عمود كهربائي وخطوط كهرباء مقطوعة متدنية على الأرض بجانبه. يبدو فاقداً للوعي. ماذا تفعل؟',
            en: 'You see a man who has fallen near an electricity pole with broken power lines lying on the ground beside him. He appears to be unconscious. What do you do?',
          },
          options: [
            { ar: 'تقترب منه بسرعة وتتحقق من تنفّسه', en: 'Approach him quickly and check his breathing' },
            { ar: 'تبقى بعيداً، تتصل بالطوارئ، وتصف الموقع والحالة بدقة', en: 'Stay back, call the emergency services, and describe the location and situation accurately' },
            { ar: 'تحاول إبعاد الأسلاك عنه بعصا خشبية لتستطيع الاقتراب', en: 'Try to push the cables away from him with a wooden stick so you can approach' },
            { ar: 'تطلب من شخص آخر بجانبك أن يقترب بدلاً منك', en: 'Ask someone else nearby to approach him instead of you' },
          ],
          correct: 1,
          feedback: {
            ar: 'الكهرباء تنتقل عبر التربة في نطاق قد يصل إلى عشرة أمتار حول الكابل المقطوع — الاقتراب مميت حتى من دون لمس الأسلاك مباشرة. محاولة إبعاد الأسلاك بأي وسيلة تُعرّض حياتك للخطر. وطلبك من شخص آخر أن يقترب يضيف ضحية محتملة، لا يحلّ المشكلة. الشيء الوحيد الصحيح هو الابتعاد، وإبعاد الآخرين، والاتصال بالطوارئ مع وصف دقيق للموقف — وهذا وحده أكثر مما يبدو للوهلة الأولى.',
            en: 'Electricity travels through the ground in a radius that can reach ten metres from a severed cable — approaching is lethal even without touching the cables directly. Trying to move the cables by any means puts your life at risk. Asking someone else to approach adds a potential casualty rather than solving the problem. The only correct action is to step back, keep others back, call the emergency services, and describe the situation accurately.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 2
    {
      id: 'emergency-call',
      tag: { ar: 'الوحدة الثانية', en: 'Module 2' },
      title: { ar: 'كيف تطلب المساعدة الطارئة', en: 'How to call for emergency help' },
      lede: {
        ar: 'مكالمة منظّمة تستغرق ثلاثين ثانية أفضل بكثير من مكالمة عشوائية تستغرق ثلاث دقائق ولا تُعطي الموقع.',
        en: 'An organised call that takes thirty seconds is worth far more than a panicked one that takes three minutes and never gives the location.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'كثير من الناس يتصلون بالطوارئ في حالة هلع فيبدأون بالصراخ أو يصفون الحادث بتفصيل مُنهَك دون أن يذكروا أين هم بالضبط. منظّمو خدمات الطوارئ مدرّبون على الهدوء ومساعدتك في إعطاء المعلومات — لكن المعلومة التي تضيع في الفوضى هي دائماً الموقع، وهي المعلومة الوحيدة التي لا يستطيع أحد تخمينها. إن انقطعت المكالمة بعد ثوانٍ — وهذا يحدث — يستطيع الإسعاف أن يتحرّك إن كان يعرف أين ذهب، ولا يستطيع شيئاً إن كان يعرف ماذا حدث فحسب. لهذا السبب وحده، الموقع هو أول ما تقوله، وأهم ما تقوله.',
            en: 'Many people call the emergency services in a state of panic and begin by shouting or describing the incident in exhausting detail without saying where they are. Emergency call handlers are trained to stay calm and help you provide information — but the information that gets lost in the chaos is always the location, and it is the only piece of information nobody can guess. If the call drops after a few seconds — and this happens — an ambulance can move if it knows where to go, and it can do nothing if it only knows what happened. For that reason alone, location is the first thing you say and the most important.',
          },
        },
        {
          type: 'ordered',
          items: {
            ar: [
              'أين أنت بالضبط: العنوان الكامل أو أقرب تقاطع، وأقرب معلم بارز كمسجد أو مدرسة أو محطة وقود، والطابق إن كنت في مبنى',
              'ما الذي حدث في جملة واحدة: سقط شخص من الدرج، حادث تصادم، رجل فاقد للوعي على الرصيف، امرأة تشكو من ألم في الصدر',
              'كم عدد المصابين وما أعمارهم التقريبية: شخص واحد، رجل في الخمسين تقريباً',
              'حالة المصاب الآن: هل هو واعٍ ويستجيب؟ هل يتنفّس؟ هل هناك نزيف ظاهر؟ هل هو قادر على الكلام؟',
              'رقم هاتفك — ولا تقطع الاتصال قبل أن يطلب منك المشغّل ذلك صراحةً',
            ],
            en: [
              'Exactly where you are: the full address or nearest intersection, the nearest prominent landmark such as a mosque, school, or petrol station, and the floor if you are in a building',
              'What happened in one sentence: someone fell on the stairs, a road collision, a man unconscious on the pavement, a woman complaining of chest pain',
              'How many are injured and roughly what age: one person, a man of about fifty',
              'The casualty\'s current condition: are they conscious and responding? Are they breathing? Is there visible bleeding? Can they speak?',
              'Your phone number — and do not end the call before the handler explicitly tells you to',
            ],
          },
        },
        {
          type: 'text',
          content: {
            ar: 'في مجموعة تعمل معاً، من أسوأ ما يحدث أن يظنّ كلٌّ منهم أن الآخر قد اتصل بالطوارئ. هذا ليس إهمالاً بالضرورة — هو نتيجة طبيعية لغياب التوزيع الواضح في لحظة ضغط. تجنّب هذا بجملة واحدة واضحة: قُل باسم شخص محدّد وبصوت مسموع للجميع: «محمّد، أنت تتصل بالطوارئ الآن بينما أبقى هنا». الاسم المحدّد والمهمة المحدّدة والتوقيت المحدّد — هذه الثلاثة تُلغي كل غموض. «أحد منكم يتصل بالطوارئ» تختلف كلياً عن «محمّد يتصل الآن».',
            en: 'In a group working together, one of the worst things that can happen is for everyone to assume someone else has called the emergency services. This is not necessarily negligence — it is the natural result of unclear role allocation in a moment of pressure. Avoid it with one clear sentence: say a specific person\'s name out loud and audibly for everyone: "Mohammed, you call the emergency services now while I stay here." A specific name, a specific task, and a specific time — these three eliminate all ambiguity.',
          },
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: 'احفظ الأرقام قبل أن تحتاجها', en: 'Save the numbers before you need them' },
          content: {
            ar: 'رقم الإسعاف والدفاع المدني والمستشفى الأقرب إلى أماكن نشاطاتك المعتادة تُحفظ في هاتفك الآن، وعلى هاتف كل شخص في فريق العمل، لا على هاتف المنسّق وحده. البحث عن رقم طوارئ أثناء حادث حقيقي هو أسوأ لحظة وأسوأ مكان للبحث عنه، وهو الشيء الذي يستهلك الثواني الحاسمة التي تُحدث الفارق.',
            en: 'The ambulance number, civil defence, and nearest hospital to wherever you usually work should be saved in your phone right now, and in every team member\'s phone — not only in the coordinator\'s. Searching for an emergency number during a real incident is the worst possible moment and the worst place for a search, and it is precisely what consumes the critical seconds that make the difference.',
          },
        },
        /*
         * Practice, not assessment.
         *
         * The five points above are the right five points and they are a list
         * on a page. A real call is not a list: somebody answers, asks
         * something you were not expecting, and the seconds you spend
         * introducing yourself are seconds an ambulance is not moving. What
         * this rehearses is the first sentence, which is the one nobody gets
         * right the first time. Nothing here is marked — see the practice note
         * in course-content/types.ts.
         */
        {
          type: 'dialogue',
          title: {
            ar: 'سقطت مشاركة في ساحة خارجية وأصيبت برأسها. أنت من يتّصل',
            en: 'A participant has fallen in an outdoor yard and hit her head. You are the one calling',
          },
          speaker: { ar: 'مشغّل الطوارئ', en: 'The emergency call handler' },
          opening: { ar: 'الطوارئ، تفضّل.', en: 'Emergency services. Go ahead.' },
          turns: [
            {
              replies: [
                {
                  text: {
                    ar: 'أنا بساحة مدرسة الوردية، شارع رئيسي، جنب محطة البنزين. في بنت وقعت وعم تنزف من راسها.',
                    en: 'I’m in the yard of the Wardieh school, on the main street, next to the petrol station. A girl has fallen and is bleeding from her head.',
                  },
                  says: {
                    ar: 'وصلني الموقع. البنت واعية؟ عم تحكي معك؟',
                    en: 'Location received. Is she conscious? Is she talking to you?',
                  },
                  note: {
                    ar: 'الموقع أوّلاً، ثم ما حدث في جملة واحدة. لو انقطعت المكالمة الآن — وهذا يحدث — تستطيع سيارة الإسعاف أن تتحرّك. لا شيء آخر قلته يمكن تعويضه بهذه السهولة، ولا شيء آخر لا يستطيع أحد تخمينه.',
                    en: 'Location first, then what happened in one sentence. If the call dropped right now — and it does — an ambulance could still move. Nothing else you said is this hard to replace, and nothing else is impossible for anybody to guess.',
                  },
                  best: true,
                },
                {
                  text: {
                    ar: 'بسرعة! في وحدة وقعت وعم تنزف من راسها والدم كتير!',
                    en: 'Quickly! A girl has fallen and she’s bleeding from her head, there’s a lot of blood!',
                  },
                  says: {
                    ar: 'حاضر. وين أنت؟ العنوان بالضبط.',
                    en: 'Understood. Where are you? The exact address.',
                  },
                  note: {
                    ar: 'لم تنتهِ المكالمة، لكنّك أنفقت أوّل جملة على ما يستطيع المشغّل أن ينتظره ولم تعطه ما لا يستطيع أحد أن يخمّنه. المشغّل مدرَّب فسألك، لكن لو انقطع الخطّ في هذه اللحظة لما كان في يده شيء يفعله.',
                    en: 'The call did not end, but you spent your first sentence on what the handler could have waited for and gave him nothing that nobody else can supply. He is trained, so he asked — but had the line dropped at that moment there would have been nothing he could do.',
                  },
                },
                {
                  text: {
                    ar: 'مرحبا، أنا متطوّع بجمعية تكافل وعنّا اليوم نشاط للأطفال، وصار معنا موقف...',
                    en: 'Hello, I’m a volunteer with the Takaful association and we’re running a children’s activity today, and something has happened…',
                  },
                  says: {
                    ar: '(يقاطع) وين أنت؟',
                    en: '(cutting in) Where are you?',
                  },
                  note: {
                    ar: 'التعريف بنفسك مهذّب وليس معلومة يحتاجها أحد الآن. مشغّل الطوارئ لا يقيّم مَن أنت، يقيّم أين يرسل السيارة — وقد قاطعك لهذا السبب بالضبط.',
                    en: 'Introducing yourself is polite and is not information anybody needs right now. The handler is not assessing who you are, he is deciding where to send a vehicle — which is exactly why he cut in.',
                  },
                },
              ],
            },
            {
              replies: [
                {
                  text: {
                    ar: 'واعية وعم تحكي. في جرح فوق حاجبها عم ينزف. عمرها تقريباً أربعتعش سنة، وهي وحدها المصابة.',
                    en: 'She’s conscious and talking. There’s a cut above her eyebrow that’s bleeding. She’s about fourteen, and she’s the only one hurt.',
                  },
                  says: {
                    ar: 'تمام. السيارة طالعة. ضلّك ع الخطّ معي.',
                    en: 'Good. A vehicle is on its way. Stay on the line with me.',
                  },
                  note: {
                    ar: 'واعية، تتنفّس، تتكلّم، مكان النزف، العمر تقريباً، وعدد المصابين. هذه هي الصورة التي يبني عليها المشغّل قراره — ولاحظ أنّك لم تشخّص شيئاً ولم تخمّن، قلت ما تراه فقط.',
                    en: 'Conscious, breathing, talking, where the bleeding is, roughly how old, and how many are hurt. That is the picture the handler makes his decision on — and notice you diagnosed nothing and guessed at nothing, you said only what you can see.',
                  },
                  best: true,
                },
                {
                  text: {
                    ar: 'ما بعرف، أنا واقف بعيد عنها شوي.',
                    en: 'I don’t know, I’m standing a little way off from her.',
                  },
                  says: {
                    ar: 'قرّب منها ولا تسكّر، وقلّي شو عم تشوف.',
                    en: 'Move closer to her and don’t hang up. Tell me what you can see.',
                  },
                  note: {
                    ar: 'أنت عينا المشغّل في المكان، ولا أحد غيرك يستطيع أن يخبره بشيء. الاتصال من بعيد يجعل المكالمة أطول ويحرم المصابة من التقييم الوحيد المتاح لها الآن.',
                    en: 'You are the handler’s eyes at the scene and nobody else can tell him anything. Calling from a distance makes the call longer and deprives the casualty of the only assessment available to her right now.',
                  },
                },
                {
                  text: {
                    ar: 'شلناها ونقلناها ع الظلّ وحطّينا شي تحت راسها، وعم نحاول نوقّف النزف.',
                    en: 'We lifted her and carried her into the shade and put something under her head, and we’re trying to stop the bleeding.',
                  },
                  says: {
                    ar: 'ما تحرّكوها بعد. خلّوها متل ما هي ولا تعطوها شي تشربه.',
                    en: 'Don’t move her again. Leave her as she is and don’t give her anything to drink.',
                  },
                  note: {
                    ar: 'نقل مصاب في الرأس أو الرقبة قبل وصول المسعف قد يحوّل إصابة إلى إصابة دائمة. الوحدة الرابعة تتناول هذا بالتفصيل — والمهمّ هنا أنّك قلته للمشغّل بدل أن تخفيه، فاستطاع أن يوقفكم قبل أن تكرّروه.',
                    en: 'Moving somebody with a head or neck injury before the paramedic arrives can turn an injury into a permanent one. Module 4 covers this — what matters here is that you told the handler rather than hiding it, so he could stop you before you did it again.',
                  },
                },
              ],
            },
            {
              replies: [
                {
                  text: {
                    ar: 'تمام، رح ضلّ ع الخطّ. رقمي هوّي اللي عم تشوفه، وأنا جنبها.',
                    en: 'Alright, I’ll stay on the line. My number is the one you can see, and I’m next to her.',
                  },
                  says: {
                    ar: 'منيح. خلّي حدا يفتح البوّابة ويستنّى السيارة عالشارع.',
                    en: 'Good. Have somebody open the gate and wait for the vehicle on the street.',
                  },
                  note: {
                    ar: 'البقاء على الخطّ ليس مجاملة: المشغّل يوجّهك حتى وصول السيارة، وإن تغيّر وضع المصابة فهو أوّل من يعرف. وطلبه الأخير هو الشيء الذي ينسى الناس فعله — سيارة تدور حول المبنى تبحث عن المدخل تخسر دقائق.',
                    en: 'Staying on the line is not a courtesy: the handler talks you through it until the vehicle arrives, and if her condition changes he is the first to know. His last instruction is the thing people forget — a vehicle circling a building looking for the entrance loses minutes.',
                  },
                  best: true,
                },
                {
                  text: {
                    ar: 'تمام، شكراً. (تُقفل الخطّ)',
                    en: 'Alright, thank you. (ends the call)',
                  },
                  says: {
                    ar: '—',
                    en: '—',
                  },
                  note: {
                    ar: 'انتهت المكالمة قبل أن يقول لك المشغّل أن تُنهيها. ما خسرته: التوجيه حتى وصول السيارة، والقدرة على إبلاغه إن ساء وضعها، ووسيلة اتصاله بك إن لم يجد السائق المكان. إنهاء المكالمة قرار المشغّل لا قرارك.',
                    en: 'The call ended before the handler told you to end it. What you lost: guidance until the vehicle arrives, the ability to tell him if she deteriorates, and his way of reaching you if the driver cannot find the place. Ending the call is the handler’s decision, not yours.',
                  },
                  ends: true,
                },
                {
                  text: {
                    ar: 'رح تركها شوي وروح استنّى السيارة عالشارع.',
                    en: 'I’ll leave her for a moment and go and wait for the vehicle on the street.',
                  },
                  says: {
                    ar: 'لا تتركها. خلّي حدا تاني ينزل عالشارع.',
                    en: 'Don’t leave her. Send somebody else down to the street.',
                  },
                  note: {
                    ar: 'الفكرة صحيحة والمنفّذ خطأ. استقبال السيارة يوفّر دقائق فعلاً، لكنّه مهمّة شخص آخر — وقد تعلّمت في هذه الوحدة كيف تُسندها: باسم محدّد وبصوت مسموع.',
                    en: 'The idea is right and the person is wrong. Meeting the vehicle genuinely saves minutes, but it is somebody else’s task — and this module has already shown you how to hand it over: a specific name, said out loud.',
                  },
                },
              ],
            },
          ],
          afterword: {
            ar: 'الفرق بين مكالمة جيّدة وأخرى ليس الهدوء ولا الفصاحة — هو ترتيب أوّل جملة. الموقع أوّلاً لأنّه الشيء الوحيد الذي لا يستطيع أحد تخمينه ولا تعويضه، ثم ما جرى، ثم من وكم وكيف حاله. وآخر المكالمة ليس لك: تبقى على الخطّ حتى يقول المشغّل إنّه انتهى.',
            en: 'What separates a good call from a bad one is not calm and not fluency — it is the order of the first sentence. Location first, because it is the one thing nobody can guess and nothing else can replace, then what happened, then who and how many and how they are. And the end of the call is not yours: you stay on the line until the handler says it is over.',
          },
        },
        {
          type: 'quiz',
          id: 'fab-q2',
          label: { ar: 'قرارك', en: 'Your decision' },
          question: {
            ar: 'أثناء نشاط جماعي في ساحة خارجية، سقطت مشاركة وأصيبت برأسها وهي تنزف. أنتَ وزميلة موجودان في المكان. من يتصل بالطوارئ؟',
            en: 'During a group activity in an outdoor yard, a participant falls and injures her head and is bleeding. You and a colleague are both present. Who calls the emergency services?',
          },
          options: [
            { ar: 'كلاكما يتصلان في وقت واحد لضمان وصول المعلومة', en: 'Both of you call at the same time to make sure the information gets through' },
            { ar: 'تنتظران تقييم وضعها أولاً قبل اتخاذ أي قرار', en: 'Wait to assess her condition first before making any decision' },
            { ar: 'تحدّدان شخصاً واحداً باسمه للاتصال بينما يبقى الآخر مع المصابة', en: 'Assign one named person to call while the other stays with the injured woman' },
            { ar: 'كلاكما تتركان المصابة وتذهبان بحثاً عن هاتف بإشارة أقوى', en: 'Both leave the injured woman to go and find a phone with a stronger signal' },
          ],
          correct: 2,
          feedback: {
            ar: 'اتصالان متزامنان يُربكان خدمة الطوارئ ويعطيانها معلومات قد تتعارض. الانتظار لتقييم الوضع يُضيّع وقتاً ثميناً في إصابات الرأس حيث كل دقيقة تحسب. ترك المصابة وحدها للبحث عن إشارة يضيف خطراً. الصواب: شخص واحد محدّد باسمه يتصل، والآخر يبقى مع المصابة يطمئنها ويراقب وضعها ويحميها من الحركة.',
            en: 'Two simultaneous calls confuse the emergency service and may give contradictory information. Waiting to assess wastes precious time in head injuries where every minute counts. Both leaving the casualty alone to find a signal adds a risk. The right approach: one named person calls, the other stays with the injured woman, reassuring her, monitoring her and keeping her from moving.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 3
    {
      id: 'staying-present',
      tag: { ar: 'الوحدة الثالثة', en: 'Module 3' },
      title: { ar: 'البقاء مع المصاب حتى وصول المسعف', en: 'Staying with the casualty until the paramedic arrives' },
      lede: {
        ar: 'الدقائق بين الاتصال بالطوارئ ووصول المسعف ليست وقت انتظار — هي وقت حضور فعلي ومؤثّر.',
        en: 'The minutes between calling the emergency services and the paramedic arriving are not waiting time — they are real, impactful presence.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'الوجود بجانب شخص مصاب والحديث إليه بهدوء هو في حدّ ذاته فعل مساعدة حقيقي وذو قيمة طبية. الشخص الواعي الذي يعاني من الألم أو الخوف يحتاج أن يسمع صوتاً يُخبره أنه ليس وحده وأن المساعدة في الطريق. الذعر يُسرّع ضربات القلب ويرفع ضغط الدم ويُفاقم حالات عديدة — والصوت الهادئ بجانبه يُقلّل هذا الذعر بشكل ملحوظ. قُل بوضوح وهدوء: «أنا هنا. المساعدة في الطريق. لا تحرّك نفسك.» هذه الجملة الثلاث تفعل أشياء متعددة في آنٍ واحد: تُطمئنه، تمنعه من محاولة النهوض بمفرده مما قد يُلحق ضرراً إضافياً بإصابة لا تعرف طبيعتها بعد، وتُعلمه أن شخصاً يتابع وضعه ويسيطر على الموقف.',
            en: 'Being beside an injured person and speaking to them calmly is itself a real act of help with genuine medical value. A conscious person who is in pain or frightened needs to hear a voice telling them they are not alone and that help is coming. Panic accelerates the heartbeat, raises blood pressure, and worsens many conditions — and a calm voice beside them measurably reduces that panic. Say clearly and calmly: "I am here. Help is on the way. Do not move." Those three sentences do multiple things at once: they reassure, they prevent the person trying to get up alone which might add injury to injury, and they tell them that someone is watching and has the situation in hand.',
          },
        },
        {
          type: 'grid',
          items: [
            {
              title: { ar: 'ابقَ بجانبه', en: 'Stay beside them' },
              text: {
                ar: 'لا تتركه وحيداً إلا إن كان هناك خطر داهم على سلامتك أنت. حضورك يُهدّئه ويجعل الانتظار أقصر نفسياً ويمنع الآخرين من التدخّل غير المفيد.',
                en: 'Do not leave them alone unless there is an immediate risk to your own safety. Your presence calms them, makes the wait feel shorter, and prevents others from interfering unhelpfully.',
              },
            },
            {
              title: { ar: 'حدّثه بهدوء', en: 'Talk to them calmly' },
              text: {
                ar: 'الشخص الواعي يسمع ويفهم حتى وإن لم يستطع الكلام. أخبره بما تفعله خطوة بخطوة وأن المساعدة قادمة. الصمت يُضاعف الخوف.',
                en: 'A conscious person hears and understands even if they cannot speak. Tell them what you are doing step by step and that help is coming. Silence amplifies fear.',
              },
            },
            {
              title: { ar: 'أبعد المتفرّجين', en: 'Keep bystanders back' },
              text: {
                ar: 'الحشد يُضيف ضغطاً، يُقلّل الهواء المتاح، ويُربك المصاب. اطلب بهدوء من المحيطين الابتعاد وإفساح مجال كافٍ للتنفّس والحركة.',
                en: 'A crowd adds pressure, reduces available air, and confuses the casualty. Calmly ask those around to step back and leave enough space for breathing and movement.',
              },
            },
            {
              title: { ar: 'غطِّه إن كان الجوّ بارداً', en: 'Cover them if the air is cold' },
              text: {
                ar: 'فقدان حرارة الجسم يُعقّد الصدمة. ضع غطاءً أو معطفاً عليه — لكن انتبه: لا تُحرّك رأسه أو رقبته أثناء التغطية.',
                en: 'Loss of body heat complicates shock. Place a blanket or coat over them — but be careful not to move their head or neck while doing so.',
              },
            },
            {
              title: { ar: 'سجّل ما حدث', en: 'Record what happened' },
              text: {
                ar: 'وقت الحادث، ووضع المصاب عند وصولك، وما فعلته أو لم تفعله. المسعف سيحتاج هذه المعلومات فور وصوله لتحديد خطوته الأولى.',
                en: 'Time of the incident, the casualty\'s condition when you arrived, and what you did or did not do. The paramedic will need this information the moment they arrive to determine their first step.',
              },
            },
          ],
        },
        {
          type: 'text',
          content: {
            ar: 'حين يصل المسعف، اعطه المعلومات بترتيب واضح ومختصر بجملتين أو ثلاث: «سقط من الدرج قبل ربع ساعة، فقد وعيه للحظة ثم عاد إليه، لم أحرّكه ولم أعطه شيئاً». هذه المعلومات الدقيقة تُوفّر على المسعف وقت التقييم الثمين. وإن طُلب منك الانتحاء جانباً فافعل فوراً من دون تردّد — المسعف يحتاج المساحة والهدوء لإجراء تقييمه السريع، وتنحّيك ليس إقصاءً أو تجاهلاً، بل هو نوع آخر من المساعدة الفعلية.',
            en: 'When the paramedic arrives, give them the information in two or three clear, concise sentences: "She fell on the stairs fifteen minutes ago, lost consciousness briefly then came back, I have not moved her or given her anything." This precise information saves the paramedic valuable assessment time. And if asked to step aside, do so immediately without hesitation — the paramedic needs space and calm to carry out their rapid assessment, and stepping back is not dismissal but another form of real help.',
          },
        },
        {
          type: 'quiz',
          id: 'fab-q3',
          label: { ar: 'قرارك', en: 'Your decision' },
          question: {
            ar: 'شابّ سقط عن دراجة وهو واعٍ ويتكلّم، لكن رقبته في وضع غير طبيعي مائل بشكل مثير للقلق. ماذا تفعل؟',
            en: 'A young man has fallen from a bicycle and is conscious and talking, but his neck is in an abnormal, tilted position that looks alarming. What do you do?',
          },
          options: [
            { ar: 'تثبّت رأسه ببطء وتُعيده إلى وضع مستقيم حتى لا تزداد إصابة رقبته', en: 'Slowly stabilise his head and return it to a straight position to prevent his neck injury from worsening' },
            { ar: 'تبقى بجانبه وتطمئنه وتطلب منه ألّا يتحرّك، وتتصل بالطوارئ دون لمس رأسه أو رقبته', en: 'Stay beside him, reassure him, ask him not to move, and call the emergency services without touching his head or neck' },
            { ar: 'تطلب منه أن يجلس ببطء ويتحرّك قليلاً للتأكّد من أن بإمكانه ذلك', en: 'Ask him to sit up slowly and move a little to confirm he can do so' },
            { ar: 'تنتظر حتى يصل أهله ليقرّروا ما يريدونه بشأن تحريكه', en: 'Wait for his family to arrive and let them decide whether to move him' },
          ],
          correct: 1,
          feedback: {
            ar: 'الرقبة في وضع غير طبيعي تُشير إلى احتمال إصابة في العمود الفقري — وهي إصابة يمكن أن تكون مستقرّة حتى اللحظة التي يُحرَّك فيها الشخص. تعديل وضع الرأس أو دعوته للجلوس قد يُحوّل إصابة مستقرّة إلى ضرر دائم أو شلل. انتظار الأهل يُضيّع الوقت دون مسوّغ — هم لا يملكون معرفة طبية تُخوّلهم القرار. دورك واضح ومحدّد: لا تُحرّكه، ابقَ بجانبه، اتصل بالطوارئ.',
            en: 'A neck in an abnormal position suggests a possible spinal injury — one that may be stable right up to the moment the person is moved. Adjusting the head position or inviting him to sit up may convert a stable injury into permanent damage or paralysis. Waiting for family wastes time without justification — they carry no medical knowledge that qualifies them to decide. Your role is clear and specific: do not move him, stay beside him, call the emergency services.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 4
    {
      id: 'do-not',
      tag: { ar: 'الوحدة الرابعة', en: 'Module 4' },
      title: { ar: 'ما الذي يجب ألّا تفعله', en: 'What you must not do' },
      lede: {
        ar: 'لكلّ حظر في هذه الوحدة سبب طبّي محدّد — معرفة السبب تجعل الامتثال أسهل بكثير من حفظ القائمة.',
        en: 'Every prohibition in this module has a specific medical reason — knowing the reason makes compliance far easier than memorising the list.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'الغريزة الإنسانية في مواجهة الألم والخطر هي الفعل. وهذه غريزة تجدر الإشادة بها — لكنها تحتاج توجيهاً دقيقاً. في الإسعافات الأولية، الفعل الخاطئ أحياناً أسوأ من عدم الفعل تماماً. المبدأ الطبي الأقدم الذي يُعلَّم في كليات الطب وبرامج التدريب الطبي حول العالم — «أولاً: لا تُلحق الأذى» — لا يُقال للمرضى، بل يُقال لمن يعالجونهم ويتدخّلون من حولهم. ويشمل هذا المبدأ كلّ من يتدخّل في موقف طارئ: المسعف المحترف، والطبيب، والمتطوّع الذي يحاول المساعدة بنيّة طيبة لكن بغير تدريب كافٍ. النيّة الطيبة لا تُلغي النتيجة الضارّة.',
            en: 'The human instinct when facing pain and danger is to act. That instinct deserves to be honoured — but it needs precise guidance. In first aid, the wrong action is sometimes worse than doing nothing at all. The oldest medical principle taught in medical schools and training programmes worldwide — "first, do no harm" — is not said to patients but to those who treat and intervene around them. It applies to everyone who steps into an emergency: the professional paramedic, the doctor, and the volunteer who is trying to help with good intentions but insufficient training. Good intentions do not cancel harmful outcomes.',
          },
        },
        {
          type: 'compare',
          yesTitle: { ar: 'ما يمكنك فعله', en: 'What you can do' },
          noTitle: { ar: 'ما يجب ألّا تفعله', en: 'What you must not do' },
          yes: {
            ar: [
              'تُؤمّن المكان وتُبعد الآخرين عن الخطر',
              'تتصل بالطوارئ وتُعطيهم معلومات دقيقة ومنظّمة',
              'تبقى مع المصاب وتُحدّثه بهدوء وثبات',
              'تُغطّيه بغطاء من دون تحريك رأسه أو رقبته',
              'تستقبل الإسعاف عند المدخل وتدلّه على المصاب',
              'تُعطي المسعف معلومات دقيقة عمّا حدث وما فعلته',
            ],
            en: [
              'Make the scene safe and keep others away from danger',
              'Call the emergency services and give them accurate, organised information',
              'Stay with the casualty and speak to them calmly and steadily',
              'Cover them with a blanket without moving their head or neck',
              'Meet the ambulance at the entrance and direct it to the casualty',
              'Give the paramedic accurate information about what happened and what you did',
            ],
          },
          no: {
            ar: [
              'تُحرّك شخصاً يُشتبه بإصابة رقبته أو ظهره أو يكون في وضع غير طبيعي',
              'تُعطي أي شيء عبر الفم — ماءً أو دواءً أو طعاماً — لشخص فاقد الوعي أو شبه فاقده',
              'تسحب جسماً غريباً مغروزاً في الجسم كسكين أو قضيب أو زجاجة',
              'تزيل الخوذة عن شخص أُصيب في حادث دراجة أو سيارة',
              'تضغط مباشرةً على جرح في العين أو تُدخل أي شيء فيها',
              'تدخل مبنىً يحترق أو مكاناً غير مستقرّ لمحاولة الإنقاذ دون تدريب',
            ],
            en: [
              'Move someone with a suspected neck or back injury or who is in an abnormal position',
              'Give anything by mouth — water, medicine, or food — to someone who is unconscious or semi-conscious',
              'Pull out a foreign object embedded in the body such as a knife, rod, or glass',
              'Remove the helmet from someone injured in a bicycle or vehicle accident',
              'Press directly on an eye injury or insert anything into the eye',
              'Enter a burning building or an unstable location to attempt a rescue without training',
            ],
          },
        },
        {
          type: 'text',
          content: {
            ar: 'لكل بند في قائمة «لا تفعل» سبب طبّي محدّد يستحق الفهم. سحب جسم غريب مغروز في الجسم ممنوع لأنه في الغالب ما يضغط على الأوعية الدموية ويحدّ من النزيف — إزالته قد تُطلق نزيفاً داخلياً حاداً. إعطاء ماء لشخص فاقد الوعي أو شبه فاقده ممنوع لأن السائل قد يصل إلى الرئة ويُسبّب الاختناق. إزالة الخوذة دون معدّات تثبيت متخصّصة قد تُحوّل إصابة رقبة مستقرّة إلى شلل. الضغط على جرح في العين قد يدفع الجسم الغريب أعمق ويُتلف الشبكية. الدخول إلى مبنى يحترق يحوّلك من شخص قادر على طلب المساعدة وتوجيه المسعفين إلى شخص يحتاجها هو نفسه. ليس عليك حفظ كل هذه التفاصيل — يكفيك أن تحفظ القاعدة الجامعة: إن لم تكن متأكداً تماماً مما تفعله ومن تأثيره، لا تتدخّل فيه.',
            en: 'Every item on the "do not" list has a specific medical reason worth understanding. Pulling out an embedded object is forbidden because it is often what is pressing on blood vessels and limiting bleeding — removing it may release an acute internal haemorrhage. Giving water to an unconscious or semi-conscious person is forbidden because the fluid may reach the lungs and cause choking. Removing a helmet without specialised stabilisation equipment may convert a stable neck injury into paralysis. Pressing on an eye wound may drive the foreign object deeper and damage the retina. Entering a burning building converts you from someone able to call for help and direct paramedics into someone who needs it themselves. You do not need to memorise all these details — it is enough to remember the overarching rule: if you are not completely certain what you are doing and what its effect is, do not intervene.',
          },
        },
        {
          type: 'quiz',
          id: 'fab-q4',
          label: { ar: 'قرارك', en: 'Your decision' },
          question: {
            ar: 'رجل أُصيب بطعنة في بطنه وجسم حادّ لا يزال مغروزاً في الجرح ظاهر للعيان. وصلت إلى المكان قبل الإسعاف. ماذا تفعل؟',
            en: 'A man has been stabbed in the abdomen and a sharp object is still visibly embedded in the wound. You have arrived before the ambulance. What do you do?',
          },
          options: [
            { ar: 'تسحب الجسم الغريب برفق ثم تضغط على الجرح بقماش نظيف', en: 'Gently pull the object out then press on the wound with a clean cloth' },
            { ar: 'تتصل بالطوارئ وتُغطّي الجرح من حوله بقماش نظيف دون سحب الجسم الغريب أو الضغط عليه', en: 'Call the emergency services and cover the area around the wound with a clean cloth without pulling or pressing on the embedded object' },
            { ar: 'تعطيه مسكّناً للألم وماءً ريثما يصل الإسعاف', en: 'Give him a painkiller and water while waiting for the ambulance' },
            { ar: 'تطلب منه الاستلقاء على بطنه لإغلاق الجرح والحدّ من النزيف', en: 'Ask him to lie on his stomach to close the wound and reduce bleeding' },
          ],
          correct: 1,
          feedback: {
            ar: 'الجسم الغريب المغروز غالباً ما يضغط على الأوعية الدموية ويُحدّ من النزيف — سحبه قد يُطلق نزيفاً داخلياً حاداً وغير مرئي. الضغط المباشر على جسم مغروز يُلحق ضرراً إضافياً بالأنسجة المحيطة. إعطاء مسكّنات أو سوائل يُخفي الأعراض ويُعيق التشخيص الطبي. الاستلقاء على البطن يزيد الضغط على الجرح بدل تخفيفه. الصواب الوحيد: اتصل، وغطِّ المنطقة المحيطة بالجرح دون لمس الجسم الغريب أو الضغط عليه.',
            en: 'An embedded object is usually pressing on blood vessels and limiting bleeding — pulling it out may release an acute, invisible internal haemorrhage. Pressing directly on the embedded object causes additional damage to surrounding tissue. Giving painkillers or fluids masks symptoms and hampers medical diagnosis. Lying on the stomach increases pressure on the wound rather than reducing it. The only correct action: call, and cover the area around the wound without touching or pressing on the embedded object.',
          },
        },
        {
          type: 'quiz',
          id: 'fab-q5',
          label: { ar: 'قرارك', en: 'Your decision' },
          question: {
            ar: 'طفل في التاسعة من عمره يبتلع شيئاً ويسعل بقوة. وجهه لا يزال بلونه الطبيعي ويستطيع التنفّس والكلام. ماذا تفعل؟',
            en: 'A nine-year-old child swallows something and is coughing forcefully. Their face is still its normal colour and they can breathe and speak. What do you do?',
          },
          options: [
            { ar: 'تقلبه على بطنه وتضرب ظهره خمس ضربات بقوة', en: 'Flip them face-down and strike their back firmly five times' },
            { ar: 'تضغط على بطنه من الخلف بيديك بحركة سريعة لأعلى', en: 'Press on their abdomen from behind with your hands in a quick upward movement' },
            { ar: 'تبقى قريباً منه وتشجّعه على الاستمرار بالسعال القوي، وتتصل بالطوارئ، وتُعلمهم فوراً إن توقّف السعال أو تحوّل وجهه للزرقة', en: 'Stay close and encourage them to keep coughing forcefully, call the emergency services, and alert them immediately if the coughing stops or their face turns blue' },
            { ar: 'تضع يدك في فمه لتُخرج ما ابتلعه بسرعة', en: 'Put your hand in their mouth to quickly remove whatever they swallowed' },
          ],
          correct: 2,
          feedback: {
            ar: 'الطفل الذي يسعل بقوة ووجهه بلونه الطبيعي ويستطيع الكلام يعني أن مجرى هواؤه لم يُسدّ كلياً — والسعال القوي هو الآلية الطبيعية الأكثر فاعلية لإخراج الجسم الغريب. ضربات الظهر ومناورة الضغط البطني إجراءات تحتاج تدريباً عملياً دقيقاً لتُنفَّذ بالزاوية والقوة الصحيحتين على جسم طفل، ومن دون هذا التدريب قد تضرّ أكثر مما تنفع. وضع يد في فم الطفل قد يدفع الجسم الغريب أعمق في الحلق. دورك هو المراقبة والاتصال — وإن توقّف السعال فجأة أو تحوّل وجهه للزرقة، هذا تحوّل خطير يجب إبلاغ الطوارئ به فوراً.',
            en: 'A child who is coughing forcefully, whose face is its normal colour and who can speak means their airway is not completely blocked — and forceful coughing is the most effective natural mechanism for dislodging the foreign object. Back blows and abdominal thrusts are procedures that require precise hands-on training to execute at the right angle and force on a child\'s body, and without that training they may harm more than they help. Putting a hand in the child\'s mouth may push the object deeper into the throat. Your role is to monitor and call — and if the coughing suddenly stops or their face turns blue, that is a serious change that must be communicated to the emergency services immediately.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 5
    {
      id: 'course-limits',
      tag: { ar: 'الوحدة الخامسة', en: 'Module 5' },
      title: { ar: 'لماذا لا تُغني هذه الدورة عن تدريب عملي معتمد', en: 'Why this course is not a substitute for certified hands-on training' },
      lede: {
        ar: 'الفرق بين هذه الدورة والتدريب المعتمد ليس في المعلومات — هو في اليدين والجسم والمكرّر.',
        en: 'The difference between this course and certified training is not in the information — it is in the hands, the body, and the repetition.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'معظم المهارات الجوهرية في الإسعافات الأولية هي مهارات جسدية لا يمكن تعلّمها بالقراءة وحدها. الإنعاش القلبي الرئوي يتطلّب ضغطاً بقوة محدّدة وعمق محدّد ووتيرة محدّدة — مئة وعشرون ضغطة في الدقيقة — على قفص صدري حقيقي أو دمية مصمّمة لهذا الغرض. فتح مجرى الهواء يتطلّب زاوية دقيقة في وضع الرأس تختلف بين البالغ والطفل والرضيع. الضغط على نزيف حادّ يتطلّب قوة وثباتاً ومكاناً دقيقاً. مناورة هيمليش تتطلّب تحديد نقطة الضغط الصحيحة وقوة محدّدة دون أن تُكسر الأضلاع. هذه الأشياء لا تُتعلّم بقراءة وصفها — تُتعلّم بالممارسة الجسدية المتكرّرة مع مدرّب مختص يُصحّح الضغط والزاوية والإيقاع في الوقت الحقيقي.',
            en: 'Most core first aid skills are physical skills that cannot be learned by reading alone. CPR requires pressing with a specific force, depth, and rhythm — one hundred and twenty compressions per minute — on a real chest or a purpose-built manikin. Opening an airway requires a precise angle of the head that differs between adults, children, and infants. Pressing on a severe bleed requires force, steadiness, and an exact location. The Heimlich manoeuvre requires finding the correct pressure point and applying the right force without breaking ribs. These things are not learned by reading their description — they are learned through repeated physical practice with a qualified instructor who corrects pressure, angle, and timing in real time.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'هناك فجوة واسعة وموثّقة في علم النفس وعلم التعلّم بين «أعرف ماذا يجب أن أفعل» و«أستطيع أن أفعله بشكل صحيح الآن تحت ضغط موقف حقيقي». المهارات الحركية — وهي ما يُطلق عليه العلماء هذه التسمية — تحتاج إلى أن يكون الجسم قد مرّ بالحركة عشرات بل مئات المرات حتى يُؤدّيها تلقائياً وبشكل صحيح حين لا يوجد وقت للتفكير. في الإنعاش القلبي الرئوي تحديداً، الدراسات تُظهر أن حتى المدرّبين يبدأون في تراجع جودة أدائهم بعد أسابيع من آخر تدريب. لهذا السبب يُجدّد المسعفون المحترفون في معظم دول العالم شهاداتهم كل سنتين. هذه الدورة تُعطيك شيئاً حقيقياً وذا قيمة لا يجوز الاستهانة به: فهم ما يجري في موقف طارئ، معرفة دورك وحدوده، واتخاذ القرارات الصحيحة في الثواني الأولى. لكن التدريب العملي المعتمد هو ما يُعطيك المهارة الفعلية لتنفيذ الإجراءات.',
            en: 'There is a wide, documented gap in psychology and learning science between "I know what I should do" and "I can do it correctly right now under the pressure of a real situation." Motor skills — as scientists call them — require the body to have gone through the movement tens or even hundreds of times before it can perform them automatically and correctly when there is no time to think. In CPR specifically, studies show that even trained people begin to see quality decline within weeks of their last training session. This is why professional paramedics renew their certifications every two years in most countries. This course gives you something real and valuable that should not be underestimated: understanding what is happening in an emergency, knowing your role and its limits, and making correct decisions in the first seconds. But certified hands-on training is what gives you the actual skill to carry out the procedures.',
          },
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: 'كيف تحصل على التدريب الحقيقي', en: 'How to get real training' },
          content: {
            ar: 'دورات الإسعافات الأولية المعتمدة متاحة في معظم دول العالم من خلال الهلال الأحمر والصليب الأحمر الدولي ومنظمات صحية وتدريبية أخرى. معظمها يستغرق يوماً أو يومين كاملين، تتضمّن تدريباً عملياً على دمى وسيناريوهات واقعية مع مدرّبين معتمدين، وتُجدَّد الشهادة كل ثلاث سنوات. إن كنت متطوّعاً في مجال الخدمات الإنسانية أو العمل مع الجمهور بصفة منتظمة، فهذا التدريب ليس رفاهية اختيارية — هو استثمار حقيقي في حياة من حولك وفي قدرتك على المساعدة الفعلية وقت الحاجة.',
            en: 'Certified first aid courses are available in most countries through the Red Crescent, the International Red Cross, and other health and training organisations. Most take one or two full days and include hands-on practice with manikins and realistic scenarios with certified instructors, with certification renewed every three years. If you are a volunteer in humanitarian services or work regularly with the public, this training is not an optional luxury — it is a real investment in the lives of those around you and in your actual ability to help when it matters.',
          },
        },
        {
          type: 'quiz',
          id: 'fab-q6',
          label: { ar: 'تحقّق من فهمك', en: 'Check your understanding' },
          question: {
            ar: 'ماذا يعني قول هذه الدورة أنها «لا تُغني عن تدريب عملي معتمد»؟',
            en: 'What does it mean when this course says it "does not replace certified hands-on training"?',
          },
          options: [
            { ar: 'أن محتوى الدورة غير موثوق وتحتاج إلى التحقّق منه من مصادر أخرى', en: 'That the course content is unreliable and you need to verify it from other sources' },
            { ar: 'أن المهارات اليدوية كالإنعاش القلبي الرئوي تحتاج ممارسة جسدية متكرّرة مع مدرّب لا تُتعلّم بالقراءة وحدها', en: 'That hands-on skills like CPR require repeated physical practice with an instructor and cannot be learned through reading alone' },
            { ar: 'أن هذه الدورة موجّهة فقط لمن لا يعرفون القراءة والكتابة', en: 'That this course is aimed only at people who cannot read or write' },
            { ar: 'أن قراءة الكتب الطبية المتخصّصة تعوّض كلاً من هذه الدورة والتدريب العملي معاً', en: 'That reading specialised medical books compensates for both this course and hands-on training together' },
          ],
          correct: 1,
          feedback: {
            ar: 'هذه الدورة تُعطيك ما يمكن إعطاؤه نظرياً وهو في حدّ ذاته ذو قيمة حقيقية: كيف تُقيّم الموقف، متى وكيف تتصل بالطوارئ، ما الذي تفعله وما الذي لا تفعله، ولماذا. لكن المهارات اليدوية كالإنعاش القلبي الرئوي تحتاج ممارسة جسدية مكرّرة مع مدرّب يصحّح الأداء حتى يُؤدّيها الجسم تلقائياً وبشكل صحيح في موقف حقيقي. لا توجد دورة نظرية، مهما بلغت جودتها، تعوّض ذلك — والكتب الطبية حتى لو قرأتها كلّها لن تُعلّمك كيف تضغط بالقوة الصحيحة على القفص الصدري.',
            en: 'This course gives you what can genuinely be given theoretically — and that is itself of real value: how to assess the situation, when and how to call the emergency services, what to do and what not to do, and why. But hands-on skills like CPR require repeated physical practice with an instructor who corrects performance until the body can perform them automatically and correctly in a real situation. No theoretical course, however good, can replace that — and even if you read all the medical textbooks ever written, they will not teach you how to press at the correct force and depth on a real chest.',
          },
        },
      ],
    },
  ],
};
