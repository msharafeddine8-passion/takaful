import type { CourseContent } from './types';

/**
 * Level 2 — Documentation, Reports and Minutes.
 *
 * The dullest-sounding course in the programme and one of the most
 * consequential, because almost everything else in this academy depends on
 * something having been written down: an incident report is what makes a
 * pattern visible, a set of minutes is what makes a decision binding, and a
 * risk log nobody wrote is a risk nobody managed.
 *
 * Written around one distinction that most volunteers have never been taught
 * explicitly — a fact against an interpretation — because it is the thing that
 * separates a report somebody can act on from one that starts an argument.
 */

export const documentationAndReporting: CourseContent = {
  slug: 'documentation-and-reporting',
  level: 2,
  minutes: 25,
  passMark: 70,
  title: {
    ar: 'التوثيق وكتابة التقارير والمحاضر',
    en: 'Documentation, Reports and Minutes',
  },
  lede: {
    ar: 'ما جرى فعلاً، مكتوباً بحيث يفهمه شخص لم يحضر — والفرق بين واقعة ورأي، وكيف تُوثّق حادثاً من دون كشف بيانات أحد.',
    en: 'What actually happened, written so somebody who was not there can follow it — the difference between a fact and an opinion, and how to document an incident without exposing anyone’s data.',
  },
  outcomes: {
    ar: [
      'تكتب محضر اجتماع يسجّل القرارات والمهام ومن يتولّاها',
      'تفصل الوقائع عن الآراء والتفسيرات في تقرير نشاط',
      'تكتب تقرير حادث كاملاً دون كشف بيانات لا يحتاجها القارئ',
      'تؤرشف الملفات بحيث تُسترجع بعد سنة من دونك',
    ],
    en: [
      'Write minutes that record decisions, actions and who owns them',
      'Separate facts from opinions and interpretations in an activity report',
      'Write a complete incident report without exposing data the reader does not need',
      'Archive files so they can be found a year later without you',
    ],
  },
  sources: [
    'Core Humanitarian Standard on Quality and Accountability (2024 edition)',
    'IFRC Volunteering Policy (August 2022)',
    'International Child Safeguarding Standards — Keeping Children Safe',
  ],

  /*
   * A course about writing that could not ask anybody to write. The whole
   * distinction it teaches — a fact against an interpretation — is invisible
   * in a multiple-choice question, because the four options are already
   * written by somebody who knows which is which.
   *
   * Additive: no fingerprint moves and no certificate is affected. See
   * lib/programme/practical.ts.
   */
  practical: {
    id: 'dr-minutes',
    title: {
      ar: 'محضر اجتماع يمكن العمل به',
      en: 'Minutes somebody can act on',
    },
    brief: {
      ar: 'اكتب محضر اجتماع فريق حضرته أو تتخيّله: جلسة تحضير لنشاط قادم.\n\nابدأ بتاريخ الاجتماع ومن حضره. ثمّ سجّل ما جرى بحيث يفهمه شخص لم يكن في الغرفة: القرارات التي اتُّخذت، والمهامّ التي خرجت منها ومن يتولّى كلّاً منها وموعدها، وما أُجّل ولماذا أُجّل.\n\nافصل الواقعة عن الرأي. إن كان في المحضر تفسير فقل إنّه تفسير ومن قاله. ولا تضع فيه بيانات شخصيّة لا يحتاجها من سيقرأه.',
      en: 'Write the minutes of a team meeting you attended or can picture: a session planning an upcoming activity.\n\nStart with the date and who was there. Then record what happened so that somebody who was not in the room can follow it: the decisions taken, the actions that came out of them with an owner and a date for each, and what was deferred and why.\n\nKeep facts apart from interpretations. Where the minutes carry an interpretation, say that it is one and whose it is. And put no personal data in them that the reader does not need.',
    },
    looksLike: {
      ar: [
        'تاريخ الاجتماع وأسماء من حضروا',
        'قرار مكتوب كقرار، لا كوصف للنقاش الذي دار حوله',
        'كلّ مهمّة ولها صاحب وموعد',
        'ما أُجّل، ولماذا أُجّل',
        'لا بيانات شخصيّة زائدة عن حاجة من سيقرأ المحضر',
      ],
      en: [
        'The date of the meeting and who attended',
        'A decision written as a decision, not as the discussion around it',
        'Every action with an owner and a date',
        'What was deferred, and why it was',
        'No personal data beyond what the reader of the minutes needs',
      ],
    },
    minChars: 350,
    maxChars: 6000,
  },

  modules: [
    // ---------------------------------------------------------------- 1
    {
      id: 'why',
      tag: { ar: 'الوحدة الأولى', en: 'Module 1' },
      title: { ar: 'لماذا يُكتب شيء أصلاً', en: 'Why anything gets written down' },
      lede: {
        ar: 'التوثيق ليس روتيناً إدارياً. هو الفرق بين حادثة معزولة ونمط يمكن إيقافه.',
        en: 'Documentation is not administrative routine. It is the difference between an isolated incident and a pattern somebody can stop.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'حادثة واحدة تُروى شفهياً تبقى حادثة واحدة. الثالثة المشابهة، إن كانت الأولى والثانية مكتوبتين، تصبح نمطاً — وعندها فقط يمكن لأحد أن يتصرّف. أغلب ما يُكتشف متأخّراً في المنظمات لم يكن سرّاً؛ كان معروفاً لأشخاص متفرّقين لم يكتب أحدهم ما رآه.',
            en: 'One incident told out loud stays one incident. A third similar one, if the first two were written down, becomes a pattern — and only then can anybody act. Most of what organisations discover too late was never a secret; it was known to scattered individuals, none of whom wrote down what they saw.',
          },
        },
        {
          type: 'grid',
          items: [
            {
              title: { ar: 'يحمي المستفيد', en: 'It protects the person served' },
              text: {
                ar: 'قلق مكتوب يمكن متابعته. قلق قيل في السيارة يضيع مع نهاية اليوم.',
                en: 'A written concern can be followed up. One mentioned in the car is gone by the end of the day.',
              },
            },
            {
              title: { ar: 'يحمي المتطوّع', en: 'It protects the volunteer' },
              text: {
                ar: 'حين يُسأل أحدهم بعد شهور «لماذا تصرّفت هكذا؟»، السجلّ هو جوابه.',
                en: 'When somebody is asked months later why they acted as they did, the record is their answer.',
              },
            },
            {
              title: { ar: 'يحفظ المعرفة', en: 'It keeps the knowledge' },
              text: {
                ar: 'الفريق يتغيّر. ما لم يُكتب يخرج من الجمعية مع أول شخص يغادر.',
                en: 'Teams change. What is not written leaves the association with the first person who goes.',
              },
            },
          ],
        },
        {
          type: 'quiz',
          id: 'dr-q1',
          label: { ar: 'تحقّق من فهمك', en: 'Check your understanding' },
          question: {
            ar: 'انتهى نشاط بلا مشاكل تُذكر. هل يُكتب تقرير؟',
            en: 'An activity ends with no problems worth mentioning. Is a report written?',
          },
          options: [
            { ar: 'لا — التقارير للحوادث، والكتابة بلا سبب إهدار وقت', en: 'No — reports are for incidents, and writing without cause wastes time' },
            {
              ar: 'نعم، تقرير قصير: العدد وما نُفّذ وما لم يُنفّذ وما يستحقّ التعديل في المرّة القادمة',
              en: 'Yes, a short one: the numbers, what was delivered, what was not, and what is worth changing next time',
            },
            { ar: 'يُكتب فقط إن طلبته المنسّقة', en: 'Only if the coordinator asks for one' },
            { ar: 'تكفي رسالة في مجموعة الفريق', en: 'A message in the team group is enough' },
          ],
          correct: 1,
          feedback: {
            ar: 'التقرير ليس سجلّ مشاكل. بلا تقارير الأيام العادية لا يوجد ما يُقارَن به يوم غير عادي — ولا يُعرف كم مرّة نجح النشاط قبل أن يفشل مرّة. ورسالة في المجموعة ليست أرشيفاً: لا تُسترجع بعد سنة ولا يقرأها من انضمّ لاحقاً. والانتظار حتى تُطلب يعني أن ما يُكتب هو ما تصادف أن أحداً تذكّره.',
            en: 'A report is not a log of problems. Without reports on ordinary days there is nothing to compare an extraordinary one against — and no way to know how many times an activity worked before it failed once. A message in the group is not an archive: it cannot be retrieved a year later and is not read by whoever joins afterwards. And waiting to be asked means what gets written is whatever somebody happened to remember.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 2
    {
      id: 'facts',
      tag: { ar: 'الوحدة الثانية', en: 'Module 2' },
      title: { ar: 'الواقعة والرأي', en: 'Facts and interpretations' },
      lede: {
        ar: 'المهارة الأساسية في هذه الدورة، ومصدر أغلب التقارير التي تُسبّب مشاكل.',
        en: 'The core skill in this course, and the source of most reports that cause trouble.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'الواقعة شيء يستطيع شخصان حضرا الموقف أن يتّفقا عليه: ما قيل، ومتى، ومن كان حاضراً، وماذا حدث. التفسير هو ما تستنتجه أنت من ذلك. الاثنان ضروريان، لكن خلطهما في جملة واحدة يجعل التقرير غير قابل للاستخدام — لأن القارئ لم يعد يعرف أين ينتهي ما رأيته ويبدأ ما ظننته.',
            en: 'A fact is something two people who were present could agree on: what was said, when, who was there, what happened. An interpretation is what you concluded from it. Both are necessary, but mixing them into one sentence makes a report unusable — because the reader can no longer tell where what you saw ends and what you thought begins.',
          },
        },
        {
          type: 'compare',
          yesTitle: { ar: '✔ واقعة', en: '✔ Fact' },
          noTitle: { ar: '✘ تفسير مكتوب كأنه واقعة', en: '✘ An interpretation written as a fact' },
          yes: {
            ar: [
              '«وصل الطفل الساعة ١٠:١٥ ولم يشارك في النشاط.»',
              '«قال: بابا بيزعق كتير.»',
              '«رفع صوته على المجموعة مرّتين خلال النشاط.»',
              '«لم يستلمه أحد حتى ١:٤٠.»',
            ],
            en: [
              '"The child arrived at 10:15 and did not join the activity."',
              '"He said: dad shouts a lot."',
              '"He raised his voice at the group twice during the activity."',
              '"Nobody collected him until 13:40."',
            ],
          },
          no: {
            ar: [
              '«الطفل كان منطوياً وحزيناً.»',
              '«يبدو أن هناك عنفاً في البيت.»',
              '«زميلي كان عصبياً ولا يصلح للعمل مع الأطفال.»',
              '«الأهل مهملون.»',
            ],
            en: [
              '"The child was withdrawn and sad."',
              '"There appears to be violence at home."',
              '"My colleague was aggressive and is unsuited to working with children."',
              '"The parents are neglectful."',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'warn',
          title: { ar: 'التفسير لا يُحذف — يُوضع في مكانه', en: 'An interpretation is not deleted — it is put in its place' },
          content: {
            ar: 'رأيك مهمّ: أنت من كان هناك. لكنه يُكتب في سطر منفصل ومعلَّم، مثل «ملاحظتي: بدا لي خائفاً حين ذُكر البيت». هكذا يستطيع من يقرأ أن يزن الواقعة والانطباع كلاً على حدة، وأن يبني قراراً على الأولى ويستأنس بالثاني — بدل أن يرث استنتاجك بلا أن يعرف أنه استنتاج.',
            en: 'Your reading matters: you were the one there. But it goes on a separate, labelled line — "my observation: he seemed frightened when home was mentioned". That way the reader can weigh the fact and the impression separately, build a decision on the first and take account of the second, rather than inheriting your conclusion without knowing it was one.',
          },
        },
        /*
         * Practice, not assessment.
         *
         * The two lists above can be read and agreed with by somebody who
         * still cannot tell one from the other in a sentence nobody has
         * sorted for them — which is the actual skill. The only way to find
         * out is to try it, and this costs no marks.
         */
        {
          type: 'sort',
          prompt: {
            ar: 'ضع كل جملة في مكانها. الواقعة شيء يستطيع شخصان حضرا الموقف أن يتّفقا عليه.',
            en: 'Put each sentence where it belongs. A fact is something two people who were there could agree on.',
          },
          buckets: [
            { id: 'fact', label: { ar: 'واقعة', en: 'Fact' } },
            { id: 'view', label: { ar: 'تفسير', en: 'Interpretation' } },
          ],
          items: [
            {
              text: { ar: '«تأخّر عن النشاط ثلاث مرات هذا الشهر.»', en: '"He was late to the activity three times this month."' },
              bucket: 'fact',
              because: {
                ar: 'عدد ومدّة. أي شخص يفتح سجلّ الحضور يصل إلى الرقم نفسه.',
                en: 'A count and a period. Anyone opening the attendance sheet arrives at the same number.',
              },
            },
            {
              text: { ar: '«لا يهتمّ بالنشاط.»', en: '"He is not interested in the activity."' },
              bucket: 'view',
              because: {
                ar: 'استنتاج عن نيّة شخص. قد يكون صحيحاً، وقد يكون السبب أن الباص يصل متأخراً — والجملة كما هي لا تترك لأحد مجالاً ليسأل.',
                en: 'A conclusion about what somebody intends. It may be right, or the bus may arrive late — and the sentence as written leaves nobody room to ask.',
              },
            },
            {
              text: { ar: '«قالت الأم إنها لا تستطيع إحضاره يوم السبت.»', en: '"His mother said she cannot bring him on Saturdays."' },
              bucket: 'fact',
              because: {
                ar: 'كلام منقول منسوب إلى قائله. الواقعة هنا أن هذا قيل، لا أنه صحيح.',
                en: 'Reported speech, attributed. The fact is that this was said — not that it is true.',
              },
            },
            {
              text: { ar: '«الجوّ في المجموعة كان متوتّراً.»', en: '"The mood in the group was tense."' },
              bucket: 'view',
              because: {
                ar: 'انطباع. اكتب ما رأيته — «تكلّم اثنان بصوت عالٍ وخرج ثالث» — ثم انطباعك في سطر معلَّم تحته.',
                en: 'An impression. Write what you saw — "two of them raised their voices and a third walked out" — then your impression on a labelled line under it.',
              },
            },
            {
              text: { ar: '«لم يحضر أحد من اللجنة الاجتماع.»', en: '"Nobody from the committee attended the meeting."' },
              bucket: 'fact',
              because: {
                ar: 'قابل للتحقّق من محضر الاجتماع، ولا يحتمل قراءتين.',
                en: 'Checkable against the minutes, and not open to two readings.',
              },
            },
            {
              text: { ar: '«المكان غير مناسب للأطفال.»', en: '"The venue is not suitable for children."' },
              bucket: 'view',
              because: {
                ar: 'حكم. الواقعة التي تحته قد تكون «الدرج بلا درابزين والباب يفتح على الشارع» — وهذه يمكن معالجتها، أما الحكم فلا.',
                en: 'A judgement. The fact underneath it might be "the stairs have no rail and the door opens onto the street" — which can be acted on, where a judgement cannot.',
              },
            },
          ],
        },
        {
          type: 'quiz',
          id: 'dr-q2',
          label: { ar: 'تحقّق من فهمك', en: 'Check your understanding' },
          question: {
            ar: 'أيّ الجمل التالية صالحة كواقعة في تقرير حادث؟',
            en: 'Which of the following works as a fact in an incident report?',
          },
          options: [
            { ar: '«كانت الأمّ غاضبة جداً وغير متعاونة.»', en: '"The mother was very angry and uncooperative."' },
            {
              ar: '«رفعت الأمّ صوتها وطلبت مقابلة المسؤولة، وغادرت الساعة ١٢:٢٠ قبل انتهاء التوزيع.»',
              en: '"The mother raised her voice, asked to see the person in charge, and left at 12:20 before the distribution ended."',
            },
            { ar: '«الأمّ لم تفهم المعايير رغم الشرح.»', en: '"The mother did not understand the criteria despite the explanation."' },
            { ar: '«حصل توتّر بسبب سوء تنظيم التوزيع.»', en: '"There was tension because the distribution was badly organised."' },
          ],
          correct: 1,
          feedback: {
            ar: '«غاضبة وغير متعاونة» وصف لحالتها كما قرأتها أنت. و«لم تفهم» ادّعاء عمّا يدور في رأسها لا يمكنك معرفته — ربما فهمت ورفضت. و«سوء التنظيم» استنتاج عن السبب، وهو غالباً ما يكون صحيحاً وليس مكانه سطر الوقائع. الثاني وحده يمكن لشخصين حضرا أن يتّفقا عليه، وهو أيضاً الوحيد الذي يحفظ كرامتها: يصف ما فعلته لا ما «هي عليه».',
            en: '"Angry and uncooperative" describes her state as you read it. "Did not understand" claims something about what was in her head that you cannot know — she may have understood and disagreed. "Badly organised" is a conclusion about cause, often a correct one, and not what belongs on the facts line. Only the second is something two people who were there could agree on — and it is also the only one that keeps her dignity: it describes what she did, not what she is.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 3
    {
      id: 'minutes',
      tag: { ar: 'الوحدة الثالثة', en: 'Module 3' },
      title: { ar: 'محضر الاجتماع', en: 'Meeting minutes' },
      lede: {
        ar: 'اجتماع بلا محضر هو اجتماع سيُعاد بعد شهر بالحوار نفسه.',
        en: 'A meeting with no minutes is a meeting that will be held again next month, with the same discussion.',
      },
      blocks: [
        {
          type: 'ordered',
          items: {
            ar: [
              'التاريخ ومن حضر ومن غاب',
              'كل قرار في جملة واحدة: ماذا تقرّر، لا ماذا نُوقش',
              'كل مهمّة باسم شخص وتاريخ، لا «الفريق» ولا «قريباً»',
              'ما لم يُحسم، ومتى يُعاد إليه',
              'يُرسل المحضر خلال يوم — بعد ثلاثة أيام صار ذاكرة لا سجلّاً',
            ],
            en: [
              'The date, who attended, and who did not',
              'Each decision in one sentence: what was decided, not what was discussed',
              'Each action with a person’s name and a date — not "the team", not "soon"',
              'What was left open, and when it comes back',
              'Send it within a day — after three it is a memory rather than a record',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: 'المهمّة بلا اسم لن تُنفَّذ', en: 'An action with no name will not happen' },
          content: {
            ar: 'أكثر بند يتكرّر في المحاضر ولا يُنفَّذ هو البند المكتوب باسم الجميع. «سنتواصل مع البلدية» يعني أن كل حاضر يفترض أن غيره سيفعلها. اسم واحد وتاريخ واحد يحوّلان النيّة إلى التزام — ويجعلان السؤال في الاجتماع القادم ممكناً بلا اتّهام.',
            en: 'The item that most often appears in minutes and never happens is the one addressed to everybody. "We will contact the municipality" means every person present assumes somebody else will. One name and one date turn an intention into a commitment — and make the question at the next meeting askable without it sounding like an accusation.',
          },
        },
        /*
         * Practice, not assessment. Written as a scenario rather than a
         * question because there is no single right answer here — the
         * difference between the responses is what happens at the next
         * meeting, and that is the part worth showing.
         */
        {
          type: 'scenario',
          title: {
            ar: 'الاجتماع على وشك أن ينتهي',
            en: 'The meeting is about to end',
          },
          situation: {
            ar: 'أنت تكتب المحضر. قيل قبل قليل: «لازم نتواصل مع البلدية قبل النشاط.» وافق الجميع بإيماءة، ولم يقل أحد إنه سيفعلها. الوقت انتهى والناس بدأت تجمع أغراضها.',
            en: 'You are taking the minutes. Somebody said a moment ago: "we need to contact the municipality before the activity." Everyone nodded, and nobody said they would do it. The time is up and people are gathering their things.',
          },
          choices: [
            {
              text: {
                ar: 'تكتبها كما قيلت: «التواصل مع البلدية قبل النشاط.»',
                en: 'Write it as it was said: "contact the municipality before the activity."',
              },
              outcome: {
                ar: 'المحضر دقيق ولا أحد ينفّذ. في الاجتماع القادم يكتشف الفريق أن أحداً لم يتواصل، ويقضي عشرين دقيقة في معرفة من كان يفترض أن يفعلها — والجواب أنه لم يكن أحد.',
                en: 'The minutes are accurate and nobody acts. At the next meeting the team discovers no one made contact, and spends twenty minutes working out whose job it was — the answer being that it was nobody’s.',
              },
            },
            {
              text: {
                ar: 'تسأل قبل أن ينفضّ الاجتماع: «مين بياخدها ولوين تاريخ؟»',
                en: 'Ask before the meeting breaks up: "who is taking this, and by when?"',
              },
              outcome: {
                ar: 'سؤال من عشر كلمات يوقف الجميع نصف دقيقة، ثم يخرج اسم وتاريخ. المهمّة تُكتب باسم شخص، ويصبح السؤال عنها في الاجتماع القادم عادياً لا اتّهاماً.',
                en: 'A ten-word question stops everybody for half a minute, and a name and a date come out of it. The action is written against a person, and asking about it next time is ordinary rather than an accusation.',
              },
              best: true,
            },
            {
              text: {
                ar: 'تكتبها باسمك أنت، لأنك من لاحظ أنها بلا صاحب.',
                en: 'Put your own name on it, since you are the one who noticed it had no owner.',
              },
              outcome: {
                ar: 'تُنفَّذ هذه المرة. ومع الوقت يصير كاتب المحضر هو من يحمل كل بند معلّق، ويتعلّم الفريق أنه لا يحتاج أن يلتزم بشيء — وأنت وحدك من يدفع الثمن.',
                en: 'It gets done this time. Over a few months the person taking the minutes ends up carrying every loose item, the team learns it need not commit to anything, and you are the only one paying for it.',
              },
            },
            {
              text: {
                ar: 'تتركها خارج المحضر، فهي لم تُحسم أصلاً.',
                en: 'Leave it out of the minutes — it was never actually settled.',
              },
              outcome: {
                ar: 'الأمر يختفي تماماً. لا أحد ينفّذه ولا أحد يتذكّره، ويصل يوم النشاط بلا إذن من البلدية. ما لم يُحسم يُكتب في خانته الخاصة — «لم يُحسم، يُعاد إليه في…» — لا يُحذف.',
                en: 'It disappears altogether. Nobody does it, nobody remembers it, and the day arrives with no permission from the municipality. What was not settled goes in its own line — "left open, returns on…" — rather than out of the record.',
              },
            },
          ],
        },
        {
          type: 'quiz',
          id: 'dr-q3',
          label: { ar: 'تحقّق من فهمك', en: 'Check your understanding' },
          question: {
            ar: 'أيّ صياغة صالحة لبند مهمّة في محضر؟',
            en: 'Which of these works as an action item in minutes?',
          },
          options: [
            { ar: '«الفريق سيحضّر المواد قبل النشاط.»', en: '"The team will prepare the materials before the activity."' },
            { ar: '«ناقشنا موضوع المواد وسنرى.»', en: '"We discussed the materials and will see."' },
            {
              ar: '«ريما تشتري المواد وتسلّمها للقاعة قبل الأربعاء ١٤ منه.»',
              en: '"Rima buys the materials and delivers them to the hall before Wednesday the 14th."',
            },
            { ar: '«المواد مسؤولية من يستطيع.»', en: '"The materials are the responsibility of whoever is able."' },
          ],
          correct: 2,
          feedback: {
            ar: 'الثلاثة الأخرى لا يمكن التحقّق منها: لا تعرف من تسأل ولا متى. البند الصالح يجيب عن ثلاثة أسئلة معاً — من، وماذا، ومتى — وهذا ما يجعله قابلاً للمتابعة بلا أن يتحوّل السؤال عنه إلى مواجهة.',
            en: 'The other three cannot be checked: you do not know who to ask or when. A usable item answers three questions at once — who, what, and by when — which is what makes following it up possible without the question turning into a confrontation.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 4
    {
      id: 'incident',
      tag: { ar: 'الوحدة الرابعة', en: 'Module 4' },
      title: { ar: 'تقرير الحادث', en: 'The incident report' },
      lede: {
        ar: 'أهمّ ما تكتبه، وأكثره عرضةً لأن يُكتب بطريقة تضرّ من يفترض أن يحميه.',
        en: 'The most important thing you write, and the most liable to be written in a way that harms the person it should protect.',
      },
      blocks: [
        {
          type: 'ordered',
          items: {
            ar: [
              'متى وقع، وأين، ومن كان حاضراً',
              'ما جرى بالوقائع وبالترتيب الذي جرى به',
              'ما قيل حرفياً، بين علامتَي اقتباس، بلا تحسين للصياغة',
              'ما فعلته أنت فوراً',
              'ملاحظتك أنت، في سطر معلَّم منفصل',
              'إلى من أُرسل التقرير ومتى',
            ],
            en: [
              'When it happened, where, and who was present',
              'What happened, as facts, in the order it happened',
              'What was said, verbatim, in quotation marks, without tidying the wording',
              'What you did immediately',
              'Your own observation, on a separate labelled line',
              'Who the report went to, and when',
            ],
          },
        },
        {
          type: 'text',
          content: {
            ar: 'الاقتباس الحرفي مهمّ أكثر مما يبدو. «قال إنه يخاف من العودة» ليست مثل «قال: ما بدي ارجع عالبيت». الأولى صياغتك أنت وقد أضافت كلمة «يخاف» التي لم يقلها. من يقرأ التقرير بعدك سيبني قراره على ما ظنّ أن الطفل قاله — وقد يكون ذلك قراراً بشأن أسرته.',
            en: 'Verbatim quotation matters more than it looks. "He said he is afraid to go back" is not the same as "He said: I don’t want to go home." The first is your wording and has added the word "afraid", which he did not say. Whoever reads the report after you will build a decision on what they think the child said — and that may be a decision about his family.',
          },
        },
        {
          type: 'callout',
          variant: 'stop',
          title: { ar: 'ما لا يدخل التقرير', en: 'What does not go in the report' },
          content: {
            ar: 'أسماء أطفال آخرين لا علاقة لهم بالحادث، وتفاصيل صحّية أو عائلية لا يحتاجها القارئ ليتصرّف، وصور ما لم تُطلب صراحةً، ورأيك في شخصية أحد. القاعدة: كل معلومة في التقرير يجب أن تجيب عن سؤال «وماذا يفعل من يقرأ هذا؟». ما لا يجيب عنه هو كشف بيانات بلا سبب.',
            en: 'The names of other children with nothing to do with the incident, health or family details the reader does not need in order to act, photographs unless specifically requested, and your view of anyone’s character. The rule: every piece of information in the report has to answer the question "and what does the reader do with this?". Anything that does not is a disclosure with no reason behind it.',
          },
        },
        /*
         * Practice, not assessment.
         *
         * Everything else in this course asks the reader to judge a sentence
         * somebody has already isolated for them. A real report arrives whole,
         * mostly correct, and nobody says how much of it is not — and the line
         * that carries a child's home address sits between the date and the
         * quotation looking exactly as unremarkable as they do. Noticing is
         * the skill, and it cannot be practised on a sentence held up on its
         * own. Nothing here is marked.
         */
        {
          type: 'review',
          prompt: {
            ar: 'هذا تقرير حادث كما كُتب فعلاً. أربعة من أسطره لا تمرّ — علّم ما تراه ثم انظر ما فات.',
            en: 'This is an incident report as it was actually written. Four of its lines do not pass — flag what you see, then look at what was missed.',
          },
          docTitle: {
            ar: 'تقرير حادث — نشاط الأحد، مركز الحيّ',
            en: 'Incident report — Sunday activity, neighbourhood centre',
          },
          lines: [
            {
              label: { ar: 'التاريخ والوقت والمكان', en: 'Date, time and place' },
              text: {
                ar: 'الأحد ٩ منه، الساعة ١١:٢٠، الدرج الداخلي في مركز الحيّ.',
                en: 'Sunday the 9th, 11:20, the internal staircase at the neighbourhood centre.',
              },
              note: {
                ar: 'سليم: ثلاثة أشياء يستطيع أيّ شخص أن يتحقّق منها، ومكان محدّد لا «في المركز».',
                en: 'Sound: three things anybody can check, and a specific place rather than “at the centre”.',
              },
            },
            {
              label: { ar: 'من كان حاضراً', en: 'Who was present' },
              text: {
                ar: 'المتطوّعون: أنا، ومروان صعب، ورنا خليل. المشاركون: ١٤ طفلاً.',
                en: 'Volunteers: myself, Marwan Saab, Rana Khalil. Participants: 14 children.',
              },
              note: {
                ar: 'سليم، ولاحظ الفرق: المتطوّعون بأسمائهم لأنّهم من يمكن سؤالهم، والأطفال بعدد لأنّ أسماءهم ليست ممّا يحتاجه القارئ.',
                en: 'Sound, and notice the difference: the volunteers by name because they are who can be asked, and the children as a count because their names are not what the reader needs.',
              },
            },
            {
              label: { ar: 'ما جرى', en: 'What happened' },
              text: {
                ar: 'سقط الطفل حسن مراد (١٠ سنوات، مدرسة الوردية، ساكن في بناية أبو خليل، الطابق الثالث) عن آخر أربع درجات وارتطم كتفه بالجدار.',
                en: 'The child Hassan Mrad (10, Wardieh school, resident at the Abu Khalil building, third floor) fell down the last four steps and struck his shoulder against the wall.',
              },
              wrong: true,
              note: {
                ar: 'لا يمرّ. الاسم وحده قد يلزم؛ المدرسة والعنوان والطابق لا يخدمان أيّ قرار يُتّخذ بناءً على هذا التقرير، وهي بالضبط ما يجعل تسريبه خطراً. القاعدة: ما لا يحتاجه القارئ ليقرّر لا يُكتب.',
                en: 'Does not pass. The name alone may be needed; the school, the address and the floor serve no decision that will be taken on this report, and they are precisely what makes a leak of it dangerous. The rule: what the reader does not need in order to decide does not go in.',
              },
            },
            {
              label: { ar: 'ما جرى — تكملة', en: 'What happened — continued' },
              text: {
                ar: 'كان يركض على الدرج رغم التنبيه، وهو دائماً غير منضبط ولا يسمع الكلام.',
                en: 'He was running on the stairs despite being warned, and he is always undisciplined and never listens.',
              },
              wrong: true,
              note: {
                ar: 'لا يمرّ. «كان يركض رغم التنبيه» واقعة. «دائماً غير منضبط» حكم على شخص لا وصف لحادث — ولا يزيد فهم القارئ شيئاً، لكنّه ينقل اللوم من الدرج إلى الطفل قبل أن يقرأ أحد السطر الذي يقول إنّ الدرج بلا درابزين.',
                en: 'Does not pass. “He was running despite being warned” is a fact. “Always undisciplined” is a verdict on a person rather than a description of an incident — it adds nothing to the reader’s understanding and moves the blame from the staircase to the child before anybody reaches the line saying the staircase has no rail.',
              },
            },
            {
              label: { ar: 'ما قيل', en: 'What was said' },
              text: {
                ar: 'قال حسن: «كنت نازل بسرعة وما شفت الدرجة». وقالت رنا: «سمعت الصوت وكنت في القاعة».',
                en: 'Hassan said: “I was going down fast and I didn’t see the step.” Rana said: “I heard the noise and I was in the hall.”',
              },
              note: {
                ar: 'سليم: منقول حرفياً، بين علامتَي اقتباس، ومنسوب إلى قائله. الواقعة هنا أنّ هذا قيل، لا أنّه صحيح — وهذا ما يجعل كتابته آمنة.',
                en: 'Sound: verbatim, in quotation marks, attributed. The fact here is that this was said, not that it is true — which is what makes writing it safe.',
              },
            },
            {
              label: { ar: 'ما فعلته', en: 'What I did' },
              text: {
                ar: 'أوقفت النشاط، وبقيت معه حتى هدأ، واتّصلت بوالدته الساعة ١١:٣٥، وأبلغت منسّقة المركز.',
                en: 'I stopped the activity, stayed with him until he settled, called his mother at 11:35, and informed the centre coordinator.',
              },
              note: {
                ar: 'سليم، ومع توقيت. «اتّصلت بوالدته» وحدها تترك سؤالاً مفتوحاً عن متى — وهو أوّل ما يُسأل عنه إن اشتكى أحد لاحقاً من التأخّر.',
                en: 'Sound, and with a time on it. “I called his mother” alone leaves the question of when — and when is the first thing asked if anybody later complains of delay.',
              },
            },
            {
              label: { ar: 'ملاحظتي', en: 'My observation' },
              text: {
                ar: 'ملاحظتي: الدرج بلا درابزين وإضاءته ضعيفة، ورأيي أنّ هذا يتكرّر إن بقي كما هو.',
                en: 'My observation: the staircase has no handrail and is poorly lit, and my view is that this will happen again if it stays as it is.',
              },
              note: {
                ar: 'سليم لأنّه مُعلَّم. الرأي لا يُحذف من التقرير — يُوضع في سطر يقول إنّه رأي ومَن صاحبه، فيستطيع القارئ أن يزن الواقعة والانطباع كلّاً على حدة.',
                en: 'Sound because it is labelled. An opinion is not deleted from a report — it goes on a line that says it is one and whose it is, so the reader can weigh the fact and the impression separately.',
              },
            },
            {
              label: { ar: 'إلى من أُرسل', en: 'Where it was sent' },
              text: {
                ar: 'أُرسل مساء الأحد إلى مجموعة المتطوّعين على واتساب ليطّلع الجميع.',
                en: 'Sent on Sunday evening to the volunteers’ WhatsApp group so everyone would see it.',
              },
              wrong: true,
              note: {
                ar: 'لا يمرّ. تقرير يحمل اسم طفل وعنوانه أُرسل إلى مجموعة يقرأها من لا تعرف ولا يمكن حذفه من أجهزتهم. الوجهة ليست تفصيلاً إدارياً في تقرير حادث — هي نصف التقرير.',
                en: 'Does not pass. A report carrying a child’s name and address was sent to a group read by people you do not know and cannot be deleted from their devices. The destination is not an administrative detail on an incident report — it is half of it.',
              },
            },
            {
              label: { ar: 'الخلاصة', en: 'Conclusion' },
              text: {
                ar: 'الحادث بسيط ولا يستدعي متابعة.',
                en: 'A minor incident, no follow-up required.',
              },
              wrong: true,
              note: {
                ar: 'لا يمرّ. قرار ما إذا كان الحادث يستدعي متابعة ليس قرار من كتب التقرير، وكتابته كخلاصة يوجّه قراءة من سيقرّر فعلاً. وظيفة التقرير أن يصف ما جرى بحيث يستطيع غيرك أن يقرّر.',
                en: 'Does not pass. Whether an incident needs following up is not the writer’s decision, and putting it as a conclusion steers the reading of whoever will actually decide. A report’s job is to describe what happened well enough for somebody else to decide.',
              },
            },
          ],
          afterword: {
            ar: 'الأسطر الأربعة التي لا تمرّ لم يكتبها متطوّع مهمل — كتبها متطوّع أراد أن يكون التقرير كاملاً ومفيداً وسريع الوصول. العنوان كُتب ليكون واضحاً، والحكم كُتب ليشرح، والمجموعة اختيرت ليصل الخبر، والخلاصة كُتبت لتوفّر وقت القارئ. وكلّ واحدة منها فعلت شيئاً آخر: كشفت بيانات، ونقلت اللوم، وسرّبت التقرير، وأخذت قراراً ليس لصاحبه.',
            en: 'The four lines that do not pass were not written by a careless volunteer — they were written by one trying to make the report complete, useful and quick to circulate. The address was written to be clear, the judgement to explain, the group chosen so the news would arrive, the conclusion to save the reader time. Each of them did something else instead: exposed data, moved the blame, leaked the report, and took a decision that was not the writer’s to take.',
          },
        },
        {
          type: 'quiz',
          id: 'dr-q4',
          label: { ar: 'سيناريو حسّاس', en: 'A difficult scenario' },
          scenario: {
            ar: 'تكتب تقريراً عن طفل أفصح لك بشيء مقلق. تريد أن تشرح للقارئ خلفية الأسرة كما سمعتها من الجيران، لتساعده على الفهم.',
            en: 'You are writing a report about a child who disclosed something concerning. You want to explain the family background as you heard it from neighbours, to help the reader understand.',
          },
          question: { ar: 'ماذا تفعل بهذه الخلفية؟', en: 'What do you do with that background?' },
          options: [
            { ar: 'تكتبها كما سمعتها — كلّما زادت المعلومات كان القرار أفضل', en: 'Write it as you heard it — the more information, the better the decision' },
            {
              ar: 'لا تكتبها. تقريرك يحمل ما رأيته وسمعته بنفسك، وما نقله الجيران شائعة قد تبني عليها قراراً عن أسرة',
              en: 'Leave it out. Your report carries what you saw and heard yourself; what neighbours passed on is hearsay that a decision about a family might be built on',
            },
            { ar: 'تكتبها وتذكر أنها من الجيران', en: 'Write it, noting that it came from neighbours' },
            { ar: 'تخبر المسؤولة شفهياً ولا تكتبها', en: 'Tell the focal point verbally and leave it out of the report' },
          ],
          correct: 1,
          feedback: {
            ar: 'الخيار الثالث أفضل من الأول لأنه يسمّي المصدر، لكنه يُدخل الشائعة إلى ملفّ دائم يُقرأ لاحقاً بلا سياقها. والرابع ينقل المشكلة نفسها إلى قناة لا سجلّ لها. القاعدة أضيق مما يبدو: تقريرك يحمل ما شهدته أنت. إن كان لديك مصدر آخر تراه مهمّاً، فالمكان الصحيح أن تقول لمسؤولة الحماية إن هناك ما يستحقّ التحقّق منه — والتحقّق دورها لا دورك.',
            en: 'The third is better than the first because it names the source, but it still puts rumour into a permanent file that will be read later without its context. The fourth moves the same problem to a channel with no record. The rule is narrower than it looks: your report carries what you witnessed. If you have another source you think matters, the right move is to tell the safeguarding focal point there is something worth checking — and checking is their role, not yours.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 5
    {
      id: 'template',
      tag: { ar: 'الوحدة الخامسة', en: 'Module 5' },
      title: { ar: 'نموذج تأخذه معك', en: 'A template to take with you' },
      lede: {
        ar: 'ثلاثة قوالب قصيرة. انسخها كما هي — لا تحتاج أكثر منها في تسعين بالمئة من الحالات.',
        en: 'Three short templates. Copy them as they are — in nine cases out of ten you will not need more.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'القالب ليس شكلاً إدارياً، بل ترتيب أسئلة يمنعك من نسيان الحقل الذي سيُسأل عنه لاحقاً. اكتبه على الهاتف في اليوم نفسه ولو ناقصاً — تقرير مكتوب بعد ساعة ناقص أفضل من تقرير كامل بعد أسبوع، لأن الذاكرة تُصلح الوقائع من دون أن تخبرك أنها فعلت.',
            en: 'A template is not an administrative form; it is an order of questions that stops you forgetting the field somebody will ask about later. Write it on your phone the same day even if it is incomplete — an incomplete report written an hour later beats a complete one written a week later, because memory repairs facts without telling you it has.',
          },
        },
        {
          type: 'grid',
          items: [
            {
              title: { ar: 'تقرير نشاط', en: 'Activity report' },
              text: {
                ar: 'التاريخ · المكان · عدد المشاركين · الفريق · ما نُفّذ · ما لم يُنفّذ ولماذا · ما يُعدَّل في المرّة القادمة.',
                en: 'Date · place · number of participants · team · what was delivered · what was not and why · what to change next time.',
              },
            },
            {
              title: { ar: 'محضر اجتماع', en: 'Minutes' },
              text: {
                ar: 'التاريخ · الحضور والغياب · القرارات · المهام (اسم + تاريخ) · ما لم يُحسم · موعد العودة إليه.',
                en: 'Date · present and absent · decisions · actions (name + date) · what was left open · when it returns.',
              },
            },
            {
              title: { ar: 'تقرير حادث', en: 'Incident report' },
              text: {
                ar: 'متى · أين · من حضر · الوقائع بالترتيب · الاقتباس الحرفي · ما فعلتَه فوراً · ملاحظتك (معلَّمة) · إلى من أُرسل.',
                en: 'When · where · who was present · facts in order · verbatim quotation · what you did immediately · your observation (labelled) · who it went to.',
              },
            },
          ],
        },
        {
          type: 'text',
          content: {
            ar: 'وقبل الإرسال، اقرأ ما كتبت مرّة واحدة وأنت تسأل نفسك سؤالين فقط: هل يستطيع من لم يحضر أن يفهم ما جرى من هذا وحده؟ وهل هناك معلومة عن شخص لا يحتاجها القارئ ليتصرّف؟ السؤال الأول يمسك النقص، والثاني يمسك الزيادة — وهما الخطآن الوحيدان اللذان يقع فيهما التقرير عادةً.',
            en: 'And before sending, read it once asking yourself two questions only: could somebody who was not there understand what happened from this alone? And is there anything about a person the reader does not need in order to act? The first catches what is missing, the second catches what is surplus — and those are the only two mistakes a report usually makes.',
          },
        },
        /*
         * Practice, and the one thing in this course that has never actually
         * happened: the association has no verified hours at all, because
         * attendance keeps coming back as a photograph of a list on unlined
         * paper. The order is what makes the difference — signatures before
         * people leave, not a name recalled afterwards.
         */
        {
          type: 'order',
          prompt: {
            ar: 'انتهى النشاط. رتّب ما تفعله، من الأول إلى الأخير.',
            en: 'The activity has finished. Put what you do in order, first to last.',
          },
          steps: {
            ar: [
              'تجمع سجلّ الحضور قبل أن يغادر أحد',
              'تكتب وقت المغادرة وتوقّع أنك رأيتهم حاضرين',
              'تدوّن ما جرى في اليوم نفسه ولو ناقصاً',
              'ترفع الحضور فيُحتسب للمتطوّعين ساعاتهم',
              'تجلس مع الفريق بعد أيام لمراجعة ما يُعدَّل',
            ],
            en: [
              'Collect the attendance sheet before anybody leaves',
              'Write the leaving time and sign that you saw them there',
              'Write down what happened the same day, even if incomplete',
              'Submit the attendance so the volunteers’ hours are counted',
              'Sit with the team a few days later to review what to change',
            ],
          },
          afterword: {
            ar: 'الترتيب ليس شكلياً. التوقيع بعد انصراف الناس معناه أنك تكتب ما تتذكّره، لا ما رأيته — والساعات المبنيّة على ذاكرة لا يستطيع أحد التصديق عليها. لهذا يأتي سجلّ الحضور أولاً، والمراجعة أخيراً حين يكون الغضب قد هدأ والوقائع ما تزال مكتوبة.',
            en: 'The order is not a formality. Signing after people have gone means writing what you remember rather than what you saw — and hours built on a memory are hours nobody can verify. That is why the sheet comes first and the review comes last, once tempers have settled and the facts are still written down.',
          },
        },
        {
          type: 'reveal',
          prompt: {
            ar: 'كتبتَ في التقرير: «تصرّف الأب بعدوانية عند الاستلام». ما الخطأ، وكيف تُعيد كتابتها؟',
            en: 'You wrote in the report: "the father behaved aggressively at collection". What is wrong with it, and how would you write it again?',
          },
          answer: {
            ar: 'كلمة «بعدوانية» حكم، لا واقعة — ومن يقرأ لا يعرف ما رأيتَه فعلاً. اكتب ما جرى: «رفع صوته أمام الأطفال ودفع الباب بقوة، ثم غادر مع ابنه الساعة ١:٤٠.» ثم في سطر معلَّم: «ملاحظتي: بدا لي غاضباً من التأخير.» الأولى يستطيع أي شخص التصرّف بناءً عليها، والثانية تبقى رأيك ومعروفة أنها رأيك.',
            en: 'The word "aggressively" is a judgement, not a fact — and the reader has no idea what you actually saw. Write what happened: "he raised his voice in front of the children and pushed the door hard, then left with his son at 13:40." Then on a labelled line: "my observation: he seemed angry about the delay." Anybody can act on the first; the second stays your reading, and is known to be one.',
          },
        },
        {
          type: 'quiz',
          id: 'dr-q6',
          label: { ar: 'قرارك بالميدان', en: 'Your decision' },
          question: {
            ar: 'وقع حادث الساعة الواحدة ظهراً وأنت متعب ولديك ارتباط. متى تكتب التقرير؟',
            en: 'An incident happens at one in the afternoon. You are tired and have somewhere to be. When do you write the report?',
          },
          options: [
            { ar: 'غداً صباحاً وأنت مرتاح، فتكتبه أفضل', en: 'Tomorrow morning when you are rested, so you write it better' },
            {
              ar: 'الآن ولو ناقصاً وبالنقاط، ثم تكمله مساءً — والاقتباسات الحرفية تحديداً تُكتب فوراً',
              en: 'Now, even incomplete and in note form, then finish it in the evening — and the verbatim quotations in particular go down immediately',
            },
            { ar: 'حين تطلبه المنسّقة', en: 'When the coordinator asks for it' },
            { ar: 'تكتفي بإخبارها هاتفياً وتكتبه إن تطوّر الأمر', en: 'Just tell her by phone, and write it if things develop' },
          ],
          correct: 1,
          feedback: {
            ar: 'الذاكرة لا تفقد التفاصيل فقط، بل تعيد ترتيبها وتملأ الفراغات بما يبدو منطقياً — وأنت لن تشعر بالفرق. الجملة التي قالها الطفل بالضبط هي أول ما يضيع وأهمّ ما يُبنى عليه. النقاط الخام الآن تُصلَح لاحقاً؛ أمّا الذاكرة المعدَّلة فلا يمكن إصلاحها لأن لا أحد يعرف أنها تعدّلت.',
            en: 'Memory does not only lose detail; it reorders it and fills gaps with what seems plausible — and you will not feel the difference. The exact sentence the child said is the first thing to go and the most important thing built on. Raw notes now can be tidied later; an edited memory cannot be repaired, because nobody knows it was edited.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 6
    {
      id: 'archive',
      tag: { ar: 'الوحدة السادسة', en: 'Module 6' },
      title: { ar: 'الأرشفة', en: 'Archiving' },
      lede: {
        ar: 'الاختبار الوحيد للأرشيف: هل يجد زميل الملف بعد سنة وأنت لست موجوداً؟',
        en: 'The only test of an archive: can a colleague find the file a year from now, with you not there?',
      },
      blocks: [
        {
          type: 'list',
          items: {
            ar: [
              'التاريخ أولاً بصيغة واحدة في كل الملفات: ٢٠٢٦-٠٨-١٣',
              'ثم نوع الملف، ثم المكان أو النشاط — لا اسم مستفيد في اسم الملف أبداً',
              'مجلّد لكل نشاط لا مجلّد لكل شخص',
              'نسخة واحدة في مكان الجمعية، لا نسخ متفرّقة على أجهزة',
              'الملفات التي فيها بيانات حسّاسة تُحفظ حيث لا يفتحها إلا من يحتاجها',
            ],
            en: [
              'Date first, in one format across every file: 2026-08-13',
              'Then the kind of file, then the place or activity — never a person’s name in a filename',
              'A folder per activity, not a folder per person',
              'One copy in the association’s place, not copies scattered across devices',
              'Files holding sensitive data live where only whoever needs them can open them',
            ],
          },
        },
        {
          type: 'quiz',
          id: 'dr-q5',
          label: { ar: 'تحقّق من فهمك', en: 'Check your understanding' },
          question: {
            ar: 'أيّ اسم ملف صالح لتقرير نشاط؟',
            en: 'Which filename works for an activity report?',
          },
          options: [
            { ar: 'تقرير نهائي معدّل ٢.docx', en: 'final report revised 2.docx' },
            { ar: '2026-08-13_تقرير-نشاط_طرابلس.docx', en: '2026-08-13_activity-report_tripoli.docx' },
            { ar: 'تقرير حالة أحمد.docx', en: 'case report ahmad.docx' },
            { ar: 'تقرير الاثنين.docx', en: 'monday report.docx' },
          ],
          correct: 1,
          feedback: {
            ar: '«نهائي معدّل ٢» لا يقول متى ولا عن ماذا، وسيصبح «معدّل ٣» بعد أسبوع. و«الاثنين» أيّ اثنين؟ و«حالة أحمد» أخطرها: اسم طفل في اسم ملف يظهر في كل بحث ومشاركة ولوحة مجلّدات، ويكشفه لمن لا علاقة له بالحالة. الصيغة الثانية تُرتّب نفسها زمنياً وتقول عمّا هي بلا أن تكشف أحداً.',
            en: '"Final revised 2" says neither when nor about what, and will be "revised 3" next week. "Monday" — which Monday? "Case report ahmad" is the dangerous one: a child’s name in a filename surfaces in every search, every share and every folder listing, exposing them to people with no connection to the case. The second sorts itself chronologically and says what it is without exposing anybody.',
          },
        },
        {
          type: 'quiz',
          id: 'dr-q7',
          label: { ar: 'قرارك بالميدان', en: 'Your decision' },
          question: {
            ar: 'غادر متطوّع الفريق وعلى جهازه تقارير ستة أشهر لم تُنسخ إلى مكان الجمعية. ما الدرس؟',
            en: 'A volunteer leaves the team with six months of reports on his own device, never copied to the association’s storage. What is the lesson?',
          },
          options: [
            { ar: 'أن يُطلب منه إرسالها قبل أن يغادر', en: 'That he should be asked to send them before he goes' },
            {
              ar: 'أن الأرشفة تحدث وقت الكتابة لا وقت المغادرة — الملف يُحفظ في مكان الجمعية يوم يُكتب، وإلا فهو غير موجود',
              en: 'That archiving happens when a file is written, not when somebody leaves — a file lives in the association’s storage the day it is written, or it does not exist',
            },
            { ar: 'أن على الجمعية أن توفّر أجهزة لكل متطوّع', en: 'That the association should provide devices for every volunteer' },
            { ar: 'أن ستة أشهر مدّة طويلة بلا مراجعة', en: 'That six months is a long time without a review' },
          ],
          correct: 1,
          feedback: {
            ar: 'الطلب عند المغادرة يعتمد على أن يغادر الناس بترتيب — وهم لا يفعلون دائماً، وقد يكون الجهاز ضاع أو الشخص غادر على خلاف. والأجهزة لا تحلّ شيئاً إن بقيت العادة نفسها. الخلاصة العملية واحدة: الملف الذي يعيش على جهاز شخص واحد ليس أرشيفاً بل نسخة، والجمعية التي تعتمد عليه فقدت ستة أشهر ولم تعرف إلا بعد فوات الأوان. وهذا ينطبق على بيانات المستفيدين مرّتين، لأنها بقيت أيضاً في مكان لا تحكمه الجمعية.',
            en: 'Asking on the way out depends on people leaving in an orderly way — which they do not always, and the device may be lost or the person may have left on bad terms. Devices change nothing if the habit stays the same. There is one practical conclusion: a file living on one person’s device is a copy rather than an archive, and an association relying on it lost six months and only found out too late. That applies twice over to beneficiary data, because it was also sitting somewhere the association does not control.',
          },
        },
      ],
    },
  ],
};
