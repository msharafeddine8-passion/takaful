import type { LevelChallenge } from './types';

/**
 * Level 1 — a school-bag distribution in a rented hall.
 *
 * Deliberately not the day the level-1-challenge course already walks through.
 * That course is arrival, registration, the activity and departure, and a
 * volunteer who has just sat it would recognise every question. A distribution
 * is the same five courses under different pressure: a list of names, a queue
 * that can turn, a donor who wants a photograph, and less stock than there are
 * children.
 *
 * Every situation here needs two of the five courses at once, and the wrong
 * options are wrong the way real ones are — each satisfies one course while
 * breaking another.
 */
export const levelOneRun: LevelChallenge = {
  level: 1,
  title: {
    ar: 'توزيع حقائب مدرسية',
    en: 'A school-bag distribution',
  },
  lede: {
    ar: 'قاعة مستأجرة، لائحة أسماء، طابور، وعدد حقائب أقلّ ممّا كنتم تتوقّعون. كل قرار تتّخذه يقرّر الموقف الذي يليه.',
    en: 'A rented hall, a list of names, a queue, and fewer bags than you expected. Each decision you take decides the situation that comes next.',
  },

  openings: ['l1-list', 'l1-queue-jump'],

  steps: [
    // ============================================================== round 1
    {
      id: 'l1-list',
      round: 1,
      draws: ['digital-basics', 'teamwork'],
      situation: {
        ar: 'اللائحة ورقة واحدة فيها أسماء أربعين طفلاً وأسماء أهاليهم وأرقام هواتفهم. زميلك يقترح أن يصوّرها ويرسلها على مجموعة الواتساب حتى يشطب كلٌّ منكم الأسماء من هاتفه بدل أن تدوروا حول ورقة واحدة.',
        en: 'The list is a single sheet with forty children on it, their guardians’ names and their phone numbers. A teammate suggests photographing it and sending it to the team’s WhatsApp group so each of you can tick names off your own phone instead of crowding one piece of paper.',
      },
      question: {
        ar: 'ما ردّك على الاقتراح؟',
        en: 'What do you say to that?',
      },
      choices: [
        {
          id: 'l1-list-a',
          weight: 'sound',
          text: {
            ar: 'ترفض إخراج اللائحة من الورقة، وتقترح أن يقف اثنان عند الطاولة بالورقة نفسها ويتناوب الباقون',
            en: 'Refuse to let the list leave the paper, and propose two of you work the table from that one sheet while the others rotate',
          },
          consequence: {
            ar: 'الازدحام حول طاولة واحدة إزعاج ليوم واحد. صورة تحمل أسماء أربعين طفلاً وأرقام أهاليهم في مجموعة واتساب تبقى على هواتف لا تملكها الجمعية، وتُعاد إرسالها بعد شهر من دون أن يعرف أحد. الاقتراح حلّ لمشكلة تنظيم، بثمن لا يُدفع من جيب من اقترحه.',
            en: 'Crowding one table is an inconvenience for one day. A photograph carrying forty children’s names and their families’ numbers sits on phones the association does not control, and gets forwarded a month later without anybody knowing. The suggestion solves a logistics problem at a price its author does not pay.',
          },
          next: 'l1-photo',
        },
        {
          id: 'l1-list-b',
          weight: 'costly',
          text: {
            ar: 'توافق على شرط أن يُقصّ جزء الأرقام من الصورة قبل الإرسال',
            en: 'Agree, on condition that the phone-number column is cropped out before it is sent',
          },
          consequence: {
            ar: 'أفضل من إرسالها كاملة، وأقلّ ممّا يبدو. الاسم وحده يحدّد طفلاً ويربطه بمكان وزمن ونوع مساعدة تلقّاها — وهذا بالضبط ما لا يُنشر عن عائلة. وقصّ الصورة قرار يتّخذه من يصوّر، فإن نسيه مرّة واحدة لا يوجد ما يعيده.',
            en: 'Better than sending it whole, and less than it looks. A name alone identifies a child and ties them to a place, a time and a kind of help they received — which is exactly what is not published about a family. And the cropping is a decision the person photographing has to remember every time; the once they forget, nothing undoes it.',
          },
          next: 'l1-crowd',
        },
        {
          id: 'l1-list-c',
          weight: 'harmful',
          text: {
            ar: 'توافق — الفريق كلّه من الجمعية والمجموعة مقفلة',
            en: 'Agree — the whole team is from the association and the group is private',
          },
          consequence: {
            ar: '«المجموعة مقفلة» وصف لمن أُضيف إليها اليوم، لا لمن سيُضاف إليها بعد شهرين، ولا للهاتف الذي يُفقد أو يُباع. البيانات التي تخرج من قناة تحكمها الجمعية لا تعود إليها. هذا ليس خطأ تنظيمياً — هو الحدّ الذي تشرحه دورة المهارات الرقمية وحماية البيانات ولا يتحرّك مع نيّة الفريق.',
            en: '"The group is private" describes who is in it today, not who is added in two months, and not the phone that gets lost or sold. Data that leaves a channel the association governs does not come back into one. This is not an admin slip — it is the line Digital Skills and Data Protection draws, and it does not move because the team meant well.',
          },
          next: 'l1-crowd',
        },
      ],
    },
    {
      id: 'l1-queue-jump',
      round: 1,
      draws: ['volunteering-foundations', 'communication-skills'],
      situation: {
        ar: 'الطابور طويل. أمّ في مقدّمته تمسك يد طفل ليس على اللائحة وتقول إنه ابن جارتها التي لا تستطيع الحضور، وإنها لن تقبل أن تعود بحقيبة واحدة وطفلان معها. الناس خلفها يسمعون.',
        en: 'The queue is long. A mother at the front is holding the hand of a child who is not on the list. She says he is her neighbour’s son, that the neighbour could not come, and that she will not go home with one bag and two children. The people behind her can hear.',
      },
      question: {
        ar: 'ماذا تقول لها؟',
        en: 'What do you say to her?',
      },
      choices: [
        {
          id: 'l1-queue-a',
          weight: 'sound',
          text: {
            ar: 'تشرح لها أمام الطابور أن اللائحة وُضعت بمعايير مُعلنة، وتأخذ اسم الجارة على ورقة الطلبات لتُراجَع، وتقول لها متى ستصلها الإجابة',
            en: 'Explain to her, in front of the queue, that the list was drawn up against criteria that were published, take the neighbour’s name onto the requests sheet to be looked at, and tell her when she will get an answer',
          },
          consequence: {
            ar: 'الشرح العلني هو ما يحمي بقيّة الطابور: ثلاثون شخصاً يرون الآن أن المعيار واحد للجميع وأنه ليس مزاج المتطوّع. وأخذ الاسم ليس مماطلة — هو الفرق بين «لا» وبين «لا، وهذه هي الطريقة». والموعد هو ما يجعل الوعد وعداً.',
            en: 'Explaining out loud is what protects the rest of the queue: thirty people now see that the criterion is the same for everyone and is not a volunteer’s mood. Taking the name is not a brush-off — it is the difference between "no" and "no, and here is the route". The date is what makes it a promise rather than a phrase.',
          },
          next: 'l1-photo',
        },
        {
          id: 'l1-queue-b',
          weight: 'costly',
          text: {
            ar: 'تعطيها حقيبة إضافية وتطلب منها ألّا تخبر أحداً',
            en: 'Give her a second bag and ask her not to tell anyone',
          },
          consequence: {
            ar: 'أنت لم تعطِ حقيبة — أنت أعلنت للطابور كلّه أن الإلحاح يعمل. والطلب بألّا تخبر أحداً يحوّلك إلى شريك في سرّ لن يُحفظ، ويترك المتطوّع الذي سيقف مكانك الأسبوع القادم أمام عشر أمّهات يعرفن أن هذا ممكن. الطفل ربح اليوم، والعدالة التي تحمي بقيّة الأطفال خسرت.',
            en: 'You did not give out a bag — you announced to the whole queue that insisting works. Asking her to keep quiet makes you a partner in a secret that will not keep, and leaves whoever stands here next week facing ten mothers who know it can be done. The child gained today; the fairness that protects every other child lost.',
          },
          next: 'l1-crowd',
        },
        {
          id: 'l1-queue-c',
          weight: 'harmful',
          text: {
            ar: 'تقول لها بصوت مسموع إن هذه ليست صلاحيتك وإن عليها ألّا تعطّل الطابور',
            en: 'Tell her loudly that it is not your call and she should stop holding up the queue',
          },
          consequence: {
            ar: 'الجواب صحيح في مضمونه — القرار فعلاً ليس لك — وقد قيل بطريقة تُخرج امرأة من الطابور مُحرَجة أمام جيرانها ومعها طفل يسمع. مبادئ العمل التطوّعي لا تنتهي عند صحّة الإجابة؛ الكرامة ليست إضافة تُصرف حين يتّسع الوقت. وقول «ليست صلاحيتي» من دون أن تدلّ على صاحب الصلاحية هو باب مغلق لا إحالة.',
            en: 'The content is right — it genuinely is not your call — and it was said in a way that walks a woman out of a queue humiliated in front of her neighbours, with a child listening. The principles of volunteering do not stop at a correct answer; dignity is not an extra to be spent when there is time. And "not my call" without naming whose call it is is a closed door, not a referral.',
          },
          next: 'l1-crowd',
        },
      ],
    },

    // ============================================================== round 2
    {
      id: 'l1-photo',
      round: 2,
      draws: ['working-with-children', 'volunteering-foundations'],
      situation: {
        ar: 'يصل ممثّل الجهة المانحة ومعه مصوّر. يريد صوراً لأطفال يحملون الحقائب وعليها شعار الجهة، ويقول إن التقرير لن يُقبل من دونها. لا توجد موافقات تصوير مكتوبة لأيّ من الأطفال.',
        en: 'The donor’s representative arrives with a photographer. He wants pictures of children holding the bags with the donor’s logo on them, and says the report will not be accepted without them. There is no written photography consent for any of the children.',
      },
      question: {
        ar: 'كيف تتصرّف؟',
        en: 'What do you do?',
      },
      choices: [
        {
          id: 'l1-photo-a',
          weight: 'sound',
          text: {
            ar: 'تعرض تصوير الحقائب والقاعة والمتطوّعين من دون وجوه الأطفال، وتحيل طلب صور الأطفال إلى منسّقة الفريق',
            en: 'Offer photographs of the bags, the hall and the volunteers with no children’s faces in them, and refer the request for pictures of children to the team coordinator',
          },
          consequence: {
            ar: 'الجهة المانحة تحتاج دليلاً على أن التوزيع حصل، وهذا ما عرضتَه عليها كاملاً. ما لا تملكه هو إذن أهل أربعين طفلاً، ولا يملكه ممثّل الجهة ولا منسّقتك — لكن المنسّقة تملك أن تقول «لا» لجهة مانحة، وأنت لا. الإحالة هنا ليست تهرّباً؛ هي وضع القرار عند من يستطيع تحمّل كلفته.',
            en: 'The donor needs evidence the distribution happened, and that is exactly what you offered, in full. What you do not have is the permission of forty families — and neither does the representative, and neither does your coordinator. But your coordinator can say no to a donor, and you cannot. Referring is not dodging here; it puts the decision where its cost can be carried.',
          },
          next: 'l1-report',
        },
        {
          id: 'l1-photo-b',
          weight: 'costly',
          text: {
            ar: 'تسأل الأطفال الواقفين إن كانوا موافقين على التصوير وتصوّر من يوافق',
            en: 'Ask the children standing there whether they mind being photographed, and photograph the ones who say yes',
          },
          consequence: {
            ar: 'سؤال الطفل صحيح وضروري، وهو نصف الإجراء لا كلّه: موافقة الطفل لا تُغني عن موافقة وليّ أمره، وطفل في العاشرة يقف أمام رجل غريب ومصوّر ومتطوّع ينتظر جوابه لا يقول «لا» بسهولة. أنت وضعت على طفل قراراً يخصّ صورته لسنوات قادمة.',
            en: 'Asking the child is right and necessary, and it is half the procedure rather than all of it: a child’s agreement does not stand in for a guardian’s, and a ten-year-old facing a stranger, a photographer and a waiting volunteer does not find "no" easy. You put a decision about their own image, for years to come, onto a child.',
          },
          next: 'l1-left-behind',
        },
        {
          id: 'l1-photo-c',
          weight: 'harmful',
          text: {
            ar: 'تدع المصوّر يعمل — الأهل حاضرون في القاعة ولم يعترض أحد',
            en: 'Let the photographer work — the parents are in the hall and nobody has objected',
          },
          consequence: {
            ar: 'الصمت ليس موافقة، خصوصاً من عائلة تستلم مساعدة من الجهة نفسها التي تطلب الصورة؛ الاعتراض في تلك اللحظة يبدو لها مخاطرة بالحقيبة. وحماية الطفل تشترط الموافقة المكتوبة تحديداً لأن الموافقة الضمنية تنهار عند أوّل اختلال في الموازين، وهذا اختلال.',
            en: 'Silence is not consent, least of all from a family receiving aid from the same body asking for the picture — objecting at that moment feels to them like risking the bag. Child safeguarding asks for written consent precisely because implied consent collapses at the first imbalance of power, and this is one.',
          },
          next: 'l1-left-behind',
        },
      ],
    },
    {
      id: 'l1-crowd',
      round: 2,
      draws: ['communication-skills', 'teamwork'],
      situation: {
        ar: 'بقي في الطابور اثنا عشر شخصاً وسبع حقائب. الخبر انتشر ووصل الصوت. زميلك عند الطاولة يرفع صوته ليردّ، وأنت الوحيد الذي يرى الطابور كلّه من مكانه.',
        en: 'Twelve people are left in the queue and there are seven bags. Word has spread and voices are up. Your teammate at the table is raising his voice to answer back, and you are the only one who can see the whole queue from where you stand.',
      },
      question: {
        ar: 'ما أوّل ما تفعله؟',
        en: 'What is the first thing you do?',
      },
      choices: [
        {
          id: 'l1-crowd-a',
          weight: 'sound',
          text: {
            ar: 'تقف أمام الطابور وتقول العدد بصراحة: سبع حقائب واثنا عشر اسماً، وهذا ما سيحدث للخمسة الباقين ومتى',
            en: 'Stand in front of the queue and say the numbers plainly: seven bags, twelve names, and here is what happens for the remaining five and when',
          },
          consequence: {
            ar: 'الغضب في الطابور غضب من عدم المعرفة أكثر منه من النقص. الرقم المُعلن يحوّل اثني عشر شخصاً يتنافسون إلى اثني عشر شخصاً يعرفون موقعهم. وأنت بذلك أخذت الصوت عن زميلك من دون أن تصحّحه أمام الناس — وهذا هو الفرق بين إنقاذ الموقف وكسر الفريق أمام من يشاهد.',
            en: 'Anger in a queue is more often anger at not knowing than at the shortfall. A stated number turns twelve people competing into twelve people who know where they stand. And you took the voice off your teammate without correcting him in front of anyone — which is the difference between rescuing the moment and breaking the team in public.',
          },
          next: 'l1-report',
        },
        {
          id: 'l1-crowd-b',
          weight: 'costly',
          text: {
            ar: 'تسحب زميلك جانباً أوّلاً وتتّفقان على ما ستقولانه قبل أن تعودا',
            en: 'Pull your teammate aside first and agree what the two of you will say before going back',
          },
          consequence: {
            ar: 'الاتّفاق قبل الكلام عادة جيّدة وهذه اللحظة لا تحتملها: الطاولة تبقى بلا أحد دقيقتين أمام طابور متوتّر، وهما الدقيقتان اللتان يتقدّم فيها الناس. رتّب أوّلاً، ثم تحدّث — التسلسل معكوس هنا، والكلفة يدفعها من يقف في المقدّمة.',
            en: 'Agreeing before speaking is a good habit and this moment will not carry it: the table stands empty for two minutes in front of a tense queue, and those are the two minutes in which people push forward. Settle it first, then confer — the order is inverted here, and the cost is paid by whoever is at the front.',
          },
          next: 'l1-left-behind',
        },
        {
          id: 'l1-crowd-c',
          weight: 'harmful',
          text: {
            ar: 'تطلب من زميلك أمام الطابور أن يهدأ ويترك الطاولة لك',
            en: 'Tell your teammate, in front of the queue, to calm down and leave the table to you',
          },
          consequence: {
            ar: 'أنت على حقّ في أنه فقد الموقف، وقد أعلنتَ ذلك على اثني عشر شخصاً ينتظرون. من تلك اللحظة لم يعد أمامهم فريق واحد بل متطوّعان يختلفان، وكلّ اعتراض بعدها سيبحث عن أيّهما يوافقه. التصحيح يكون على انفراد وبعد ذلك — العلن يصلح للحظة ويكسر ما بعدها.',
            en: 'You are right that he lost the moment, and you announced it to twelve waiting people. From then on they are not facing one team but two volunteers who disagree, and every objection afterwards will go looking for the one who agrees with it. Correcting is done privately and afterwards — in public it fixes the minute and breaks everything after it.',
          },
          next: 'l1-left-behind',
        },
      ],
    },

    // ============================================================== round 3
    {
      id: 'l1-report',
      round: 3,
      draws: ['digital-basics', 'teamwork', 'volunteering-foundations'],
      situation: {
        ar: 'انتهى اليوم. المنسّقة تطلب تقريراً قصيراً الليلة، وتقترح على مجموعة الفريق أن يكتب كلٌّ منكم ملاحظاته في المجموعة مباشرةً «ليكون كل شيء في مكان واحد».',
        en: 'The day is over. The coordinator asks for a short report tonight, and suggests to the team group that each of you write your notes straight into the group "so it is all in one place".',
      },
      question: {
        ar: 'ماذا تكتب، وأين؟',
        en: 'What do you write, and where?',
      },
      choices: [
        {
          id: 'l1-report-a',
          weight: 'sound',
          text: {
            ar: 'تكتب في المجموعة الأرقام وما جرى بلا أسماء، وترسل ما يخصّ شخصاً بعينه إلى المنسّقة وحدها',
            en: 'Post the figures and what happened, with no names, to the group — and send anything about a particular person to the coordinator alone',
          },
          consequence: {
            ar: 'التقرير الذي يقرأه الفريق كلّه يخدم غرضه من دون اسم واحد: العدد، النقص، الوقت، ما احتاج تصحيحاً. وما يخصّ عائلة بعينها يذهب إلى شخص واحد لأن قناة الجميع ليست قناة لأحد. هذا هو التقسيم نفسه الذي تفرضه دورة حماية البيانات، مطبَّقاً على تقرير لا على ملفّ.',
            en: 'The report the whole team reads does its job without one name in it: the count, the shortfall, the timings, what needed correcting. Anything about a particular family goes to one person, because a channel for everybody is a channel for nobody. This is the same split Digital Skills draws, applied to a report rather than to a file.',
          },
          next: null,
        },
        {
          id: 'l1-report-b',
          weight: 'costly',
          text: {
            ar: 'تكتب كل شيء في المجموعة كما طلبت المنسّقة، فهي التي تتحمّل المسؤولية',
            en: 'Write everything into the group as the coordinator asked — it is her responsibility, after all',
          },
          consequence: {
            ar: 'أن يطلب منك مسؤول شيئاً لا ينقل المسؤولية عمّا تكتبه أنت بيدك. المنسّقة طلبت مكاناً واحداً، لا طلبت أسماء عائلات — والفرق بينهما هو الذي كان عليك أن تقوله. العمل ضمن فريق يشمل أن تصحّح تعليمة يبدو أنها لم تُقصد على وجهها.',
            en: 'Being asked by somebody in charge does not move the responsibility for what you type with your own hands. She asked for one place, not for families’ names — and the difference between those two is the thing you were the one to say. Working in a team includes correcting an instruction that plainly was not meant the way it landed.',
          },
          next: null,
        },
        {
          id: 'l1-report-c',
          weight: 'harmful',
          text: {
            ar: 'لا تكتب شيئاً — اليوم انتهى على خير ولا شيء يستحقّ التوثيق',
            en: 'Write nothing — the day ended all right and there is nothing worth recording',
          },
          consequence: {
            ar: 'خمس عائلات عادت بلا حقيبة، وامرأة سُئلت عن طفل ليس على اللائحة، وجهة مانحة طلبت صوراً. كل واحدة من هذه ستُطرح مرّة أخرى، وحين تُطرح لن يكون هناك ما يُقرأ. «انتهى على خير» هو بالضبط ما يُقال قبل المرّة التي لا ينتهي فيها كذلك، والتوثيق هو ما يجعل التكرار مرئياً.',
            en: 'Five families went home without a bag, a woman was turned down over a child not on the list, and a donor asked for photographs. Every one of those comes back, and when it does there will be nothing to read. "It ended all right" is exactly what gets said before the time it does not, and a written record is what makes a pattern visible at all.',
          },
          next: null,
        },
      ],
    },
    {
      id: 'l1-left-behind',
      round: 3,
      draws: ['working-with-children', 'communication-skills'],
      situation: {
        ar: 'غادر الجميع. بقي صبيّ في التاسعة يجلس على الدرج مع حقيبته. يقول إن أخته ستأتي، وقد قال ذلك قبل نصف ساعة. الرقم الوحيد على اللائحة لا يردّ، والقاعة تُقفل بعد ربع ساعة.',
        en: 'Everyone has gone. A nine-year-old is still sitting on the steps with his bag. He says his sister is coming, and he said that half an hour ago. The one number on the list is not answering, and the hall closes in fifteen minutes.',
      },
      question: {
        ar: 'ماذا تفعل؟',
        en: 'What do you do?',
      },
      choices: [
        {
          id: 'l1-left-a',
          weight: 'sound',
          text: {
            ar: 'تبقى معه في مكان مفتوح يراه غيرك، وتطلب من زميل أن يبقى أيضاً، وتتّصل بالمنسّقة وتستمرّ في محاولة الرقم',
            en: 'Stay with him somewhere open and visible, ask a teammate to stay too, keep trying the number, and call the coordinator',
          },
          consequence: {
            ar: 'ثلاث قواعد في قرار واحد: لا تتركه، ولا تنفرد به، ولا تقرّر وحدك. وجود زميل ليس شكّاً فيك — هو ما يحمي الطفل ويحميك أنت من رواية لا شاهد عليها. والاتصال بالمنسّقة يعني أن القاعة إن أُقفلت لن يكون القرار التالي قرارك أنت وحدك في الشارع.',
            en: 'Three rules in one decision: do not leave him, do not be alone with him, do not decide alone. A second volunteer is not a doubt about you — it is what protects the child, and what protects you from an account with no witness to it. Calling the coordinator means that if the hall does close, the next decision is not yours alone on a pavement.',
          },
          next: null,
        },
        {
          id: 'l1-left-b',
          weight: 'costly',
          text: {
            ar: 'تسأله عن عنوان بيته وتعرض أن توصله بنفسك',
            en: 'Ask him where he lives and offer to walk him home yourself',
          },
          consequence: {
            ar: 'النيّة واضحة والنتيجة أنك انفردتَ بطفل في الطريق من دون علم أحد ومن دون إذن أهله. قاعدة عدم الانفراد ليست شكّاً في المتطوّعين، هي التي تجعل كل متطوّع قادراً على أن يقول أين كان وبمن — ومن دونها لا يبقى إلّا كلامك. وعنوان بيته معلومة لم يكن عليك أن تحملها.',
            en: 'The intention is plain and the result is that you are alone with a child on a street, with nobody informed and no guardian’s permission. The never-alone rule is not a suspicion of volunteers; it is what lets every volunteer say where they were and with whom — without it there is only your word. And his address is a thing you did not need to be carrying.',
          },
          next: null,
        },
        {
          id: 'l1-left-c',
          weight: 'harmful',
          text: {
            ar: 'تشرح له أن القاعة ستُقفل وتطلب منه أن ينتظر أخته عند الباب في الخارج',
            en: 'Explain that the hall is closing and ask him to wait for his sister outside by the door',
          },
          consequence: {
            ar: 'هذا ترك طفل في التاسعة وحده في الشارع بعد نشاط تحت مسؤوليّة الجمعية، ومهما بدا مؤقّتاً فهو القرار الذي لا يُتّخذ. إقفال القاعة مشكلة إدارية لها حلول — مكالمة، تأخير، مكان بديل — وسلامة الطفل ليست واحداً منها. وأنت آخر بالغ رآه.',
            en: 'That is leaving a nine-year-old alone on a street after an activity the association is responsible for, and however temporary it looks it is the one decision that is not taken. The hall closing is an administrative problem with administrative answers — a phone call, a delay, somewhere else to wait — and the child’s safety is not one of them. You are the last adult who saw him.',
          },
          next: null,
        },
      ],
    },
  ],
};
