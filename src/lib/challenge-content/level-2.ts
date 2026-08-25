import type { LevelChallenge } from './types';

/**
 * Level 2 — a day trip with fifteen teenagers to a river valley.
 *
 * Level 2 is what a real field day asks of you, and the thing that makes a day
 * trip the right shape for it is that everything happens away from the office:
 * the risk assessment either exists before the bus leaves or it never does, the
 * nearest hospital is forty minutes off, and the volunteer who posts a video
 * has already posted it by the time anybody sees.
 *
 * The tiredness in the second opening is not decoration. Every serious mistake
 * in these six situations is available to a rested volunteer and likely for an
 * exhausted one, and Time, Pressure and Wellbeing is the course that says so.
 */
export const levelTwoRun: LevelChallenge = {
  level: 2,
  title: {
    ar: 'رحلة نهارية إلى وادٍ',
    en: 'A day trip to a river valley',
  },
  lede: {
    ar: 'خمسة عشر يافعاً، حافلة، ووادٍ على بعد أربعين دقيقة من أقرب مستشفى. ما تقرّره عند الحافلة يحدّد ما ستواجهه عند النهر.',
    en: 'Fifteen teenagers, a bus, and a valley forty minutes from the nearest hospital. What you settle at the bus decides what you meet at the river.',
  },

  openings: ['l2-risk', 'l2-tired'],

  steps: [
    // ============================================================== round 1
    {
      id: 'l2-risk',
      round: 1,
      draws: ['field-safety', 'documentation-and-reporting'],
      situation: {
        ar: 'السابعة صباحاً والحافلة جاهزة. تسأل عن تقييم المخاطر فيقول لك المسؤول إنهم نفّذوا هذه الرحلة ثلاث مرّات ولم يحدث شيء، وإن الورقة ستُكتب عند العودة. لا أحد يعرف أين أقرب مستشفى ولا من يحمل صندوق الإسعافات.',
        en: 'Seven in the morning and the bus is ready. You ask for the risk assessment and the lead tells you they have run this trip three times with no trouble, and that the paperwork will be written up when you get back. Nobody knows where the nearest hospital is or who is carrying the first-aid box.',
      },
      question: {
        ar: 'ماذا تفعل والحافلة تنتظر؟',
        en: 'What do you do with the bus waiting?',
      },
      choices: [
        {
          id: 'l2-risk-a',
          weight: 'sound',
          text: {
            ar: 'تأخذ عشر دقائق قبل التحرّك لتكتبوا على ورقة واحدة: المخاطر الثلاثة الأكبر، من يقف عند كلٍّ منها، أقرب مستشفى، ومن يحمل الصندوق',
            en: 'Take ten minutes before you move to write, on one sheet: the three biggest risks, who is on each, the nearest hospital, and who carries the box',
          },
          consequence: {
            ar: '«لم يحدث شيء ثلاث مرّات» ليس تقييم مخاطر، هو عيّنة صغيرة. وتقييم المخاطر ليس النموذج المطبوع — هو أن يعرف أربعة متطوّعين قبل التحرّك من يفعل ماذا حين يقع شيء. عشر دقائق عند الحافلة أرخص من أربعين دقيقة على طريق لا تعرفون آخرها.',
            en: '"Nothing happened three times" is not a risk assessment, it is a small sample. And a risk assessment is not the printed form — it is four volunteers knowing, before the wheels move, who does what when something happens. Ten minutes at the bus is cheaper than forty on a road none of you knows the end of.',
          },
          next: 'l2-fall',
        },
        {
          id: 'l2-risk-b',
          weight: 'costly',
          text: {
            ar: 'تتحرّكون، وتكتب أنت التقييم في الطريق على هاتفك وترسله للمجموعة قبل الوصول',
            en: 'Set off, and write the assessment yourself on your phone during the drive, sending it to the group before you arrive',
          },
          consequence: {
            ar: 'أفضل بكثير من لا شيء، وينقصه الجزء الذي يعمل: التقييم الذي لم يتّفق عليه الفريق قبل التحرّك هو ورقة يقرأها من يتذكّر أن يقرأها. الأدوار تُوزَّع بالكلام في وجوه بعضكم، لا بالإرسال إلى مجموعة في حافلة فيها خمسة عشر يافعاً يصرخون.',
            en: 'Far better than nothing, and missing the part that works: an assessment the team did not agree before setting off is a document read by whoever remembers to read it. Roles get assigned out loud, face to face — not sent to a group chat on a bus with fifteen shouting teenagers on it.',
          },
          next: 'l2-post',
        },
        {
          id: 'l2-risk-c',
          weight: 'harmful',
          text: {
            ar: 'تتحرّكون — المسؤول اتّخذ قراره وهو يعرف الموقع أكثر منك',
            en: 'Set off — the lead has made his call and knows the site better than you do',
          },
          consequence: {
            ar: 'معرفته بالموقع حقيقية ولا تُغني عن الشيء المفقود، وهو أن يعرف الباقون. وأن يقرّر مسؤول لا يعني أن تسكت أنت: السلامة الميدانية هي المكان الذي يُتوقّع فيه من المتطوّع أن يسأل، وأن يسأل أمام الفريق. خمسة عشر يافعاً في وادٍ من دون خطّة طوارئ ليس قراراً إدارياً.',
            en: 'His knowledge of the site is real and does not supply the missing thing, which is everybody else knowing. And somebody being in charge is not a reason for you to go quiet: field safety is precisely where a volunteer is expected to ask, and to ask in front of the team. Fifteen teenagers in a valley with no emergency plan is not an administrative decision.',
          },
          next: 'l2-post',
        },
      ],
    },
    {
      id: 'l2-tired',
      round: 1,
      draws: ['life-skills', 'field-safety'],
      situation: {
        ar: 'هذه رحلتك الميدانية الثالثة في أربعة أيام. نمتَ أربع ساعات، وأنت الوحيد في الفريق الذي أنهى دورة مبادئ الإسعافات الأولية، ولهذا وُضع اسمك مسؤولاً للسلامة اليوم. لم يسألك أحد إن كنت قادراً.',
        en: 'This is your third field day in four. You slept four hours, you are the only one on the team who has finished the first-aid awareness course, and that is why your name is down as today’s safety lead. Nobody asked whether you were up to it.',
      },
      question: {
        ar: 'ماذا تفعل قبل أن تتحرّك الحافلة؟',
        en: 'What do you do before the bus moves?',
      },
      choices: [
        {
          id: 'l2-tired-a',
          weight: 'sound',
          text: {
            ar: 'تقول للمسؤول بصراحة إنك متعب، وتطلب أن يشاركك متطوّع ثانٍ في دور السلامة، وتذهب',
            en: 'Tell the lead plainly that you are exhausted, ask for a second volunteer to share the safety role, and go',
          },
          consequence: {
            ar: 'قول «أنا متعب» ليس انسحاباً وليس ضعفاً — هو معلومة تشغيلية يحتاجها من يوزّع الأدوار، ويستحيل أن يعرفها من دونك. وطلب شريك في الدور بدل الانسحاب منه يحلّ المشكلتين معاً: الرحلة لا تفقد الشخص الوحيد الذي درس الإسعافات، والقرار الذي قد يُتّخذ عند النهر لا يقع على شخص لم ينم.',
            en: 'Saying "I am exhausted" is neither a withdrawal nor a weakness — it is operational information the person assigning roles needs and cannot possibly have without you. And asking for a partner in the role rather than dropping it solves both problems: the trip does not lose the one person who has done the first-aid course, and the decision that may have to be made at the river does not land on somebody who has not slept.',
          },
          next: 'l2-fall',
        },
        {
          id: 'l2-tired-b',
          weight: 'costly',
          text: {
            ar: 'تذهب وتصمت، وتقرّر أن تنتبه أكثر من المعتاد لتعوّض',
            en: 'Go and say nothing, deciding to concentrate harder than usual to make up for it',
          },
          consequence: {
            ar: 'الانتباه الإضافي يعمل ساعة ثم ينهار، والإرهاق لا يظهر كخطأ بل كتأخّر ربع ثانية في ملاحظة شيء. أنت لم تخالف قاعدة، لكنك جعلت سلامة خمسة عشر يافعاً تعتمد على أن يبقى شخص لم ينم في كامل تركيزه ثماني ساعات. الرفاه النفسي في هذه الدورة ليس عن راحتك أنت وحدك.',
            en: 'Extra concentration lasts an hour and then falls over, and exhaustion does not show up as a mistake — it shows up as a quarter-second late in noticing something. You broke no rule, and you made the safety of fifteen teenagers depend on somebody who has not slept holding full attention for eight hours. Wellbeing on that course is not only about your own comfort.',
          },
          next: 'l2-post',
        },
        {
          id: 'l2-tired-c',
          weight: 'harmful',
          text: {
            ar: 'تعتذر عن الرحلة صباح اليوم نفسه وتترك الفريق يدبّر أمره',
            en: 'Pull out on the morning itself and leave the team to sort it out',
          },
          consequence: {
            ar: 'حدودك مشروعة تماماً وتوقيت وضعها ليس كذلك: الحافلة جاهزة، والاعتذار قبل ساعة يترك خمسة عشر يافعاً في وادٍ بلا أحد درس الإسعافات. الفرق بين وضع حدّ وترك فراغ هو الإشعار — الحدّ يُقال قبل أيام حين يُوزَّع الجدول، لا في السابعة صباحاً وقد فات كلّ بديل.',
            en: 'Your limit is entirely legitimate and the timing of it is not: the bus is loaded, and pulling out an hour before leaves fifteen teenagers in a valley with nobody who has done the first-aid course. The difference between setting a boundary and leaving a hole is notice — a boundary is stated days earlier when the rota goes out, not at seven in the morning when every alternative has gone.',
          },
          next: 'l2-post',
        },
      ],
    },

    // ============================================================== round 2
    {
      id: 'l2-fall',
      round: 2,
      draws: ['first-aid-basics', 'field-safety'],
      situation: {
        ar: 'فتاة في السادسة عشرة انزلقت على صخر مبلَّل. كاحلها متورّم وهي تبكي ولا تستطيع الوقوف عليه. زميلك يقول إنه رأى والده يفعلها كثيراً ويريد أن يعيد المفصل إلى مكانه، والباقون تجمّعوا حولها على الصخر.',
        en: 'A sixteen-year-old slipped on a wet rock. Her ankle is swelling, she is crying and cannot stand on it. A teammate says he has watched his father do this many times and wants to put the joint back, and everybody else has crowded onto the rock around her.',
      },
      question: {
        ar: 'ما أوّل ما تفعله؟',
        en: 'What is the first thing you do?',
      },
      choices: [
        {
          id: 'l2-fall-a',
          weight: 'sound',
          text: {
            ar: 'توقف زميلك، وتُبعد المتجمّعين عن الصخر المبلَّل، وتثبّت الكاحل كما هو، وتتّصل بالطوارئ وتعطيهم الموقع والعمر وما جرى',
            en: 'Stop your teammate, clear everyone off the wet rock, immobilise the ankle as it is, and call emergency services with the location, her age and what happened',
          },
          consequence: {
            ar: 'الترتيب هو المحتوى كلّه: أمِّن المكان أوّلاً — الصخر الذي أوقعها واحداً سيوقع ثانياً وحول مصاب لا حول متفرّج. ثم لا تحرّك ما لا تعرف: تورّم بعد انزلاق قد يكون كسراً، و«إعادة المفصل» بيد غير مدرّبة تحوّل إصابة أسبوعين إلى إصابة أشهر. دورة الإسعافات هذه توعوية بالتحديد لتعرف أين تقف.',
            en: 'The order is the whole content: make the scene safe first — the rock that took one person down will take a second, and around a casualty rather than a bystander. Then do not move what you cannot read: swelling after a slip may be a fracture, and "putting the joint back" with an untrained hand turns a two-week injury into a months-long one. That awareness course is an awareness course precisely so you know where you stop.',
          },
          next: 'l2-incident',
        },
        {
          id: 'l2-fall-b',
          weight: 'costly',
          text: {
            ar: 'تمنع زميلك وتحمل الفتاة إلى الحافلة فوراً لتوفير الوقت',
            en: 'Stop your teammate and carry the girl straight to the bus to save time',
          },
          consequence: {
            ar: 'منع زميلك كان صحيحاً، وحملها ألغى نصف ما ربحتَه. حمل مصاب من دون تثبيت وعلى صخر مبلّل يخاطر بإصابة ثانية — لها ولك — وقد يحرّك كسراً لا تراه. السرعة قيمة حقيقية في الطوارئ، وترتيبها يأتي بعد التثبيت لا قبله.',
            en: 'Stopping your teammate was right, and carrying her gave back half of what that bought. Lifting an untreated casualty across wet rock risks a second injury — hers and yours — and can move a fracture you cannot see. Speed is a real value in an emergency, and its place in the order is after immobilising, not before.',
          },
          next: 'l2-parent',
        },
        {
          id: 'l2-fall-c',
          weight: 'harmful',
          text: {
            ar: 'تدع زميلك يحاول — هو أكثر خبرة منك في هذه الأمور والفتاة تتألّم الآن',
            en: 'Let your teammate try — he has more experience with this than you do and she is in pain now',
          },
          consequence: {
            ar: 'الخبرة المنقولة عن الأب ليست تدريباً، والألم الحاضر لا يبرّر تدخّلاً قد يضاعفه. هذا هو الحدّ الوحيد الذي تكرّره دورة الإسعافات: ما لا تعرفه لا تفعله، ولو كان الانتظار مؤلماً للنظر. وإن ساءت الحال بعدها، لا يوجد ما تقوله الجمعية لأهلها.',
            en: 'Experience picked up from a father is not training, and present pain does not justify an intervention that can multiply it. This is the one limit the first-aid course repeats: what you do not know, you do not do, however hard the waiting is to watch. And if it goes badly afterwards, there is nothing the association can say to her family.',
          },
          next: 'l2-parent',
        },
      ],
    },
    {
      id: 'l2-post',
      round: 2,
      draws: ['media-and-content', 'documentation-and-reporting'],
      situation: {
        ar: 'تفتح هاتفك فترى أن زميلاً نشر مقطعاً مباشراً من الرحلة على حسابه الشخصي: وجوه اليافعين واضحة، واسم الموقع مكتوب، والتعليق يقول «أطفال محرومون يرون النهر لأوّل مرّة». المقطع منشور منذ عشرين دقيقة ووصله تعليقات.',
        en: 'You open your phone and find a teammate has posted a live video from the trip to his personal account: the teenagers’ faces are clear, the location is named, and the caption reads "deprived kids seeing a river for the first time". It has been up for twenty minutes and has comments on it.',
      },
      question: {
        ar: 'ماذا تفعل؟',
        en: 'What do you do?',
      },
      choices: [
        {
          id: 'l2-post-a',
          weight: 'sound',
          text: {
            ar: 'تكلّمه على انفراد فوراً وتطلب حذف المقطع، وتُبلغ المسؤول بما جرى بالوقت والتعليق كما كُتب',
            en: 'Speak to him privately at once and ask him to take it down, then tell the lead what happened, with the time and the caption exactly as written',
          },
          consequence: {
            ar: 'ثلاثة أخطاء في منشور واحد: وجوه بلا موافقة، وموقع يحدّد أين هم الآن، وتعليق يصف يافعين بأنهم «محرومون» أمام كل من يعرفهم. الحذف السريع يقلّل الضرر ولا يلغيه — ولهذا يُبلَّغ المسؤول: لأن ما نُسخ خلال عشرين دقيقة ليس شيئاً يقرّره متطوّعان بينهما. والتوثيق بالتعليق كما كُتب لا بوصفك له، لأنه سيُقرأ لاحقاً.',
            en: 'Three faults in one post: faces with no consent, a location that says where these young people are right now, and a caption calling teenagers "deprived" in front of everybody who knows them. Taking it down fast reduces the harm and does not undo it — which is why the lead is told: what was copied in twenty minutes is not something two volunteers settle between themselves. And the caption is recorded as written rather than as you would summarise it, because it will be read later.',
          },
          next: 'l2-incident',
        },
        {
          id: 'l2-post-b',
          weight: 'costly',
          text: {
            ar: 'تعلّق على المنشور طالباً منه حذفه',
            en: 'Comment on the post asking him to take it down',
          },
          consequence: {
            ar: 'الطلب صحيح والمكان خاطئ: تعليقك يضيف إلى المنشور حركة، ويجعل كلّ من يقرأه يعرف أن هناك مشكلة ويعود لينظر مرّة أخرى. وهو تصحيح لزميل أمام جمهوره كلّه. الرسالة الخاصّة تصل في نفس الثانية ولا تفعل أيّاً من هذين.',
            en: 'The request is right and the place is wrong: your comment adds engagement to the post and tells everybody who reads it that there is a problem, which sends them back for a second look. And it corrects a colleague in front of his entire audience. A private message arrives in the same second and does neither of those things.',
          },
          next: 'l2-parent',
        },
        {
          id: 'l2-post-c',
          weight: 'harmful',
          text: {
            ar: 'تتركه — الحساب شخصي ولا يمثّل الجمعية، والمقطع فيه نيّة طيّبة',
            en: 'Leave it — it is a personal account, it does not represent the association, and the video is kindly meant',
          },
          consequence: {
            ar: 'من يشاهد لا يرى حساباً شخصياً، يرى متطوّعاً مع أطفال في نشاط للجمعية. وحتى لو رآه كذلك، فإن الضرر لا يقع على الجمعية بل على يافعة سيقرأ زملاؤها في المدرسة أنها «محرومة». وموقع معلن لمجموعة قاصرين مسألة سلامة قبل أن تكون مسألة إعلام.',
            en: 'Nobody watching sees a personal account; they see a volunteer with children on the association’s activity. And even if they did see it that way, the harm does not land on the association — it lands on a girl whose schoolmates will read that she is "deprived". A publicly named location for a group of minors is a safety matter before it is a media one.',
          },
          next: 'l2-parent',
        },
      ],
    },

    // ============================================================== round 3
    {
      id: 'l2-incident',
      round: 3,
      draws: ['documentation-and-reporting', 'first-aid-basics'],
      situation: {
        ar: 'عدتم. المسؤول يطلب تقرير حادث الليلة. تتذكّر أن زميلك حاول الاقتراب من الكاحل قبل أن توقفه، وأن الحافلة تأخّرت عشرين دقيقة لأن أحداً لم يكن يعرف طريق المستشفى.',
        en: 'You are back. The lead wants an incident report tonight. You remember that your teammate reached for the ankle before you stopped him, and that the bus lost twenty minutes because nobody knew the road to the hospital.',
      },
      question: {
        ar: 'ماذا يدخل التقرير؟',
        en: 'What goes into the report?',
      },
      choices: [
        {
          id: 'l2-incident-a',
          weight: 'sound',
          text: {
            ar: 'ما جرى بالوقائع والأوقات، ومنه محاولة الاقتراب من الكاحل وتأخّر العشرين دقيقة، بلا وصف لنيّة أحد',
            en: 'What happened, with facts and timings — including the reach for the ankle and the twenty lost minutes — and no description of anybody’s intentions',
          },
          consequence: {
            ar: 'التقرير الذي يفيد هو الذي يمكن لشخص لم يحضر أن يتصرّف بناءً عليه: «فقدنا عشرين دقيقة لأن الطريق لم يكن معروفاً» تُنتج تغييراً في الرحلة القادمة، و«الفريق كان مرتبكاً» لا تُنتج شيئاً. وذكر محاولة زميلك ليس وشاية — هي واقعة، ومن دونها لا يعرف أحد أن الفريق يحتاج توضيحاً لحدود الإسعاف.',
            en: 'A report is useful when somebody who was not there can act on it: "we lost twenty minutes because the route was not known" produces a change to the next trip; "the team was flustered" produces nothing. And recording your teammate’s attempt is not informing on him — it is a fact, and without it nobody learns that this team needs the limits of first aid spelled out.',
          },
          next: null,
        },
        {
          id: 'l2-incident-b',
          weight: 'costly',
          text: {
            ar: 'تكتب الإصابة والإسعاف والنقل، وتترك محاولة زميلك خارج التقرير وتقول له الأمر شفهياً',
            en: 'Write up the injury, the response and the transfer, leave your teammate’s attempt out of it, and tell him about it verbally',
          },
          consequence: {
            ar: 'حماية زميل من عقوبة لم تُطلب منك تكلّف الفريق التالي المعلومة نفسها. والكلام الشفهي يُنسى خلال أسبوع، بينما التقرير يُقرأ بعد سنة حين تتكرّر الواقعة مع متطوّع آخر — وعندها لن يبدو أنها تكرّرت. التوثيق ليس عن الشخص، هو عن النمط.',
            en: 'Shielding a colleague from a consequence nobody asked for costs the next team the same piece of information. A verbal word is gone inside a week, while the report is read a year later when it happens again with a different volunteer — and then it will not look like a repeat. Documentation is not about the person; it is about the pattern.',
          },
          next: null,
        },
        {
          id: 'l2-incident-c',
          weight: 'harmful',
          text: {
            ar: 'تكتب أن الإصابة كانت طفيفة وأن كل شيء جرى حسب الخطة — الفتاة بخير في النهاية',
            en: 'Write that the injury was minor and everything went to plan — the girl is fine in the end',
          },
          consequence: {
            ar: 'هذا ليس تبسيطاً، هو تقرير غير صحيح. «حسب الخطة» لا يمكن أن يُكتب عن يوم لم تكن فيه خطة، وشدّة الإصابة ليست تقديرك أنت بل تقدير من فحصها. وإن ظهر لاحقاً أن الكاحل مكسور، فإن الجمعية ستكون قد كتبت بخطّ يدك أن الأمر كان طفيفاً — وهذا ما يفقدها ثقة عائلة وثقة جهة رقابية معاً.',
            en: 'This is not simplification, it is an untrue report. "To plan" cannot be written about a day on which there was no plan, and the severity of an injury is not your assessment but that of whoever examined it. If the ankle turns out to be broken, the association will have written in your hand that it was minor — and that is what costs it a family’s trust and a regulator’s in the same sentence.',
          },
          next: null,
        },
      ],
    },
    {
      id: 'l2-parent',
      round: 3,
      draws: ['media-and-content', 'life-skills'],
      situation: {
        ar: 'الحادية عشرة ليلاً. تتّصل بك والدة إحدى المشاركات على رقمك الشخصي — وجدته في مجموعة الأهالي. تسأل عمّا جرى بالضبط، وتطلب منك أن ترسل لها الصور التي التُقطت اليوم، وأن تعطيها رقم المتطوّع الذي كان مع ابنتها.',
        en: 'Eleven at night. A participant’s mother calls your personal number — she found it in the parents’ group. She asks exactly what happened, asks you to send her today’s photographs, and asks for the number of the volunteer who was with her daughter.',
      },
      question: {
        ar: 'كيف تردّ؟',
        en: 'How do you answer?',
      },
      choices: [
        {
          id: 'l2-parent-a',
          weight: 'sound',
          text: {
            ar: 'تطمئنها على ابنتها بما رأيتَه أنت، وتقول إن الصور وأرقام المتطوّعين تمرّ عبر الجمعية لا عبرك، وتعطيها قناة الجمعية وموعداً للردّ صباحاً',
            en: 'Reassure her about her daughter with what you yourself saw, say that photographs and volunteers’ numbers go through the association rather than through you, and give her the association’s channel and a time for an answer in the morning',
          },
          consequence: {
            ar: 'أمّ قلقة تستحقّ جواباً في الحادية عشرة ليلاً، وهذا ما أعطيتَه. وما رفضتَه ليس رفضاً لها: الصور فيها أطفال غيرها، ورقم زميلك ليس ملكك، وكلاهما يمرّ بقناة تستطيع الجمعية أن تقف خلفها. والموعد الصباحي هو ما يحوّل «لا» إلى «ليس الآن ومن هنا».',
            en: 'A worried mother deserves an answer at eleven at night, and that is what you gave. What you declined is not a refusal of her: the photographs have other people’s children in them, your colleague’s number is not yours to give, and both belong in a channel the association can stand behind. The morning time is what turns "no" into "not now, and here is where".',
          },
          next: null,
        },
        {
          id: 'l2-parent-b',
          weight: 'costly',
          text: {
            ar: 'ترسل لها الصور التي فيها ابنتها فقط، وتؤجّل الباقي',
            en: 'Send her only the photographs with her daughter in them, and leave the rest',
          },
          consequence: {
            ar: 'الفرز على عجل في الحادية عشرة ليلاً هو بالضبط الظرف الذي تمرّ فيه صورة فيها طفلة أخرى في الخلفية. وأنت أنشأت سابقة: من الغد يعرف كل وليّ أمر أن الصور تُطلب من هاتفك الشخصي، وأنت لست قناة ولا تستطيع أن تكون. النيّة سليمة والقناة خاطئة.',
            en: 'Sorting in a hurry at eleven at night is exactly the circumstance in which a picture with another girl in the background gets through. And you have set a precedent: from tomorrow every guardian knows photographs can be had from your personal phone, and you are not a channel and cannot become one. The intention is fine and the route is wrong.',
          },
          next: null,
        },
        {
          id: 'l2-parent-c',
          weight: 'harmful',
          text: {
            ar: 'تعتذر عن الحديث وتقفل — الوقت متأخّر وهذا ليس رقم عمل',
            en: 'Excuse yourself and hang up — it is late and this is not a work number',
          },
          consequence: {
            ar: 'حقّك في ألّا تعمل في الحادية عشرة ليلاً حقيقي، وهذه المكالمة تحديداً عن ابنتها التي أُصيبت اليوم. إقفال الخطّ يترك أمّاً بلا معلومة عن طفلتها ويترك الجمعية أمام غضب لا علاقة له بالحادث. الحدّ يُوضع بجملة — «سأخبرك بما أعرفه، والباقي غداً عبر الجمعية» — لا بإنهاء المكالمة.',
            en: 'Your right not to be working at eleven at night is real, and this particular call is about her daughter, who was injured today. Hanging up leaves a mother with nothing about her own child, and leaves the association facing an anger that has nothing to do with the accident. A boundary is set with a sentence — "I will tell you what I know, the rest tomorrow through the association" — not by ending the call.',
          },
          next: null,
        },
      ],
    },
  ],
};
